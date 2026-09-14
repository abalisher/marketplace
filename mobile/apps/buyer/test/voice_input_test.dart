import 'dart:async';
import 'dart:typed_data';

import 'package:core/auth/auth_controller.dart';
import 'package:core/auth/auth_customer.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:ui_kit/app_icon_button.dart';
import 'package:ui_kit/app_mic_button.dart';
import 'package:ui_kit/app_recording_indicator.dart';
import 'package:ui_kit/app_theme.dart';

import 'package:marketplace_buyer/features/assistant/domain/chat_file.dart';
import 'package:marketplace_buyer/features/assistant/data/assistant_repository.dart';
import 'package:marketplace_buyer/features/assistant/data/voice_exception.dart';
import 'package:marketplace_buyer/features/assistant/data/voice_recorder.dart';
import 'package:marketplace_buyer/features/assistant/data/voice_repository.dart';
import 'package:marketplace_buyer/features/assistant/data/wav_pcm16.dart';
import 'package:marketplace_buyer/features/assistant/domain/assistant_reply.dart';
import 'package:marketplace_buyer/features/assistant/domain/chat_message.dart';
import 'package:marketplace_buyer/features/assistant/domain/voice_failure.dart';
import 'package:marketplace_buyer/features/assistant/domain/voice_recording.dart';
import 'package:marketplace_buyer/features/assistant/domain/voice_transcript.dart';
import 'package:marketplace_buyer/features/assistant/providers/assistant_repository_provider.dart';
import 'package:marketplace_buyer/features/assistant/providers/chat_history_store_provider.dart';
import 'package:marketplace_buyer/features/assistant/providers/voice_recorder_provider.dart';
import 'package:marketplace_buyer/features/assistant/providers/voice_repository_provider.dart';
import 'package:marketplace_buyer/features/assistant/screens/chat_screen.dart';
import 'no_assistant_cart.dart';
import 'no_assistant_stream.dart';

/// Ассистент в этих тестах не участвует: проверяем путь «голос → текст в поле»,
/// а отправку сообщения покрывает chat_screen_test.
class _SilentAssistantRepository
    with NoAssistantStream, NoAssistantCart
    implements AssistantRepository {
  @override
  Future<AssistantReply> send({
    required List<ChatMessage> history,
    String? cartId,
    String? orderId,
    List<ChatFile> files = const [],
  }) => Completer<AssistantReply>().future;
}

/// Фейк микрофона: отдаёт заданную запись либо падает заданной причиной.
/// Микрофона в тестовой среде нет — граница [VoiceRecorder] и есть точка
/// подмены.
class _FakeVoiceRecorder implements VoiceRecorder {
  _FakeVoiceRecorder({
    this.startFailure,
    this.stopFailure,
    VoiceRecording? recording,
  }) : recording =
           recording ??
           VoiceRecording(
             mimeType: 'audio/wav',
             bytes: Uint8List(0),
             duration: const Duration(seconds: 3),
           );

  final VoiceFailure? startFailure;
  final VoiceFailure? stopFailure;
  final VoiceRecording recording;

  bool started = false;
  bool cancelled = false;

  @override
  Future<void> start() async {
    if (startFailure != null) throw VoiceException(startFailure!);
    started = true;
  }

  @override
  Future<VoiceRecording?> stop() async {
    if (stopFailure != null) throw VoiceException(stopFailure!);
    started = false;
    return recording;
  }

  @override
  Future<void> cancel() async {
    cancelled = true;
    started = false;
  }

  @override
  Future<void> dispose() async {}
}

/// Фейк распознавания: возвращает заданный текст (пустой — «не расслышали»)
/// либо падает.
class _FakeVoiceRepository implements VoiceRepository {
  _FakeVoiceRepository({this.text = 'нужен цемент М400, двадцать мешков'});

  final String text;
  int calls = 0;
  VoiceRecording? lastRecording;

  @override
  Future<VoiceTranscript> transcribe(VoiceRecording recording) async {
    calls++;
    lastRecording = recording;
    return VoiceTranscript(text: text, language: 'ru');
  }
}

/// Отмена записи: круглая кнопка-иконка с крестиком. Ищем именно по иконке —
/// в композере теперь есть и скрепка вложений (T10.4c), она того же типа.
final _cancelButton = find.widgetWithIcon(AppIconButton, Icons.close_rounded);

late SharedPreferences _prefs;

Future<void> _pump(WidgetTester tester, Widget app) async {
  tester.view.physicalSize = const Size(412, 892);
  tester.view.devicePixelRatio = 1.0;
  addTearDown(tester.view.reset);
  await tester.pumpWidget(app);
}

Widget _harness({
  required VoiceRecorder recorder,
  required VoiceRepository voice,
}) {
  return ProviderScope(
    overrides: [
      assistantRepositoryProvider.overrideWithValue(
        _SilentAssistantRepository(),
      ),
      voiceRecorderProvider.overrideWithValue(recorder),
      voiceRepositoryProvider.overrideWithValue(voice),
      authControllerProvider.overrideWith(_GuestAuthController.new),
      sharedPreferencesProvider.overrideWithValue(_prefs),
    ],
    child: MaterialApp(theme: buildAppTheme(), home: const ChatScreen()),
  );
}

class _GuestAuthController extends AuthController {
  @override
  Future<AuthCustomer?> build() async => null;
}

void main() {
  setUp(() async {
    SharedPreferences.setMockInitialValues({});
    _prefs = await SharedPreferences.getInstance();
  });

  group('WAV из сэмплов PCM16', () {
    test('заголовок описывает ровно то, что записано', () {
      final wav = wavFromPcm16(
        pcmBytes: List<int>.filled(1600, 7),
        sampleRate: 16000,
        numChannels: 1,
      );
      expect(wav.length, 44 + 1600);
      expect(String.fromCharCodes(wav.sublist(0, 4)), 'RIFF');
      expect(String.fromCharCodes(wav.sublist(8, 12)), 'WAVE');
      expect(String.fromCharCodes(wav.sublist(36, 40)), 'data');
      final header = ByteData.sublistView(wav, 0, 44);
      // Размер файла без первых 8 байт.
      expect(header.getUint32(4, Endian.little), 36 + 1600);
      expect(header.getUint16(20, Endian.little), 1); // PCM без сжатия
      expect(header.getUint16(22, Endian.little), 1); // моно
      expect(header.getUint32(24, Endian.little), 16000);
      expect(header.getUint32(28, Endian.little), 32000); // байт в секунду
      expect(header.getUint16(32, Endian.little), 2); // выравнивание блока
      expect(header.getUint16(34, Endian.little), 16); // бит на сэмпл
      expect(header.getUint32(40, Endian.little), 1600);
      expect(wav[44], 7);
    });

    test('реальная частота устройства попадает в заголовок', () {
      // Устройство поправило частоту под себя — если записать в заголовок
      // запрошенную, речь звучала бы замедленной и распозналась бы мусором.
      final wav = wavFromPcm16(
        pcmBytes: const [1, 2, 3, 4],
        sampleRate: 48000,
        numChannels: 2,
      );
      final header = ByteData.sublistView(wav, 0, 44);
      expect(header.getUint32(24, Endian.little), 48000);
      expect(header.getUint16(22, Endian.little), 2);
      expect(header.getUint32(28, Endian.little), 48000 * 2 * 2);
    });
  });

  group('Голосовой ввод композера', () {
    testWidgets('запись: поле уступает место индикатору, рядом — отмена', (
      tester,
    ) async {
      final recorder = _FakeVoiceRecorder();
      await _pump(
        tester,
        _harness(recorder: recorder, voice: _FakeVoiceRepository()),
      );
      await tester.pumpAndSettle();

      expect(find.byType(AppRecordingIndicator), findsNothing);
      // В покое из круглых кнопок-иконок в композере только скрепка (T10.4c);
      // отмена записи появляется лишь на время записи.
      expect(_cancelButton, findsNothing);

      await tester.tap(find.byType(AppMicButton));
      await tester.pump();

      expect(recorder.started, isTrue);
      expect(find.byType(AppRecordingIndicator), findsOneWidget);
      expect(find.text('Идёт запись…'), findsOneWidget);
      // Отмена появляется только на время записи.
      expect(_cancelButton, findsOneWidget);
    });

    testWidgets('распознанный текст дописывается в поле, а не отправляется', (
      tester,
    ) async {
      final voice = _FakeVoiceRepository();
      await _pump(
        tester,
        _harness(recorder: _FakeVoiceRecorder(), voice: voice),
      );
      await tester.pumpAndSettle();

      await tester.tap(find.byType(AppMicButton));
      await tester.pump();
      await tester.tap(find.byType(AppMicButton));
      await tester.pumpAndSettle();

      expect(voice.calls, 1);
      // Длительность уходит на бэкенд: предел 60 с он проверяет по ней.
      expect(voice.lastRecording?.duration, const Duration(seconds: 3));
      // Текст лежит в поле — покупатель правит его и отправляет сам (T11.4).
      expect(find.text('нужен цемент М400, двадцать мешков'), findsOneWidget);
      expect(find.byType(AppRecordingIndicator), findsNothing);
    });

    testWidgets('пустая расшифровка: «не расслышали», ручной ввод на месте', (
      tester,
    ) async {
      await _pump(
        tester,
        _harness(
          recorder: _FakeVoiceRecorder(),
          voice: _FakeVoiceRepository(text: ''),
        ),
      );
      await tester.pumpAndSettle();

      await tester.tap(find.byType(AppMicButton));
      await tester.pump();
      await tester.tap(find.byType(AppMicButton));
      await tester.pumpAndSettle();

      expect(
        find.text('Не расслышали. Попробуйте ещё раз или наберите сообщение'),
        findsOneWidget,
      );
    });

    testWidgets('отказ в доступе к микрофону объясняется текстом', (
      tester,
    ) async {
      await _pump(
        tester,
        _harness(
          recorder: _FakeVoiceRecorder(startFailure: VoiceFailure.denied),
          voice: _FakeVoiceRepository(),
        ),
      );
      await tester.pumpAndSettle();

      await tester.tap(find.byType(AppMicButton));
      await tester.pumpAndSettle();

      expect(
        find.text(
          'Нет доступа к микрофону. Разрешите запись в настройках — '
          'или наберите сообщение',
        ),
        findsOneWidget,
      );
      // Запись не началась — индикатора нет, поле на месте.
      expect(find.byType(AppRecordingIndicator), findsNothing);
    });

    testWidgets('слишком длинная запись: причина названа, ход не делается', (
      tester,
    ) async {
      final voice = _FakeVoiceRepository();
      await _pump(
        tester,
        _harness(
          recorder: _FakeVoiceRecorder(stopFailure: VoiceFailure.tooLarge),
          voice: voice,
        ),
      );
      await tester.pumpAndSettle();

      await tester.tap(find.byType(AppMicButton));
      await tester.pump();
      await tester.tap(find.byType(AppMicButton));
      await tester.pumpAndSettle();

      expect(
        find.text('Запись слишком длинная. Попробуйте покороче'),
        findsOneWidget,
      );
      // Распознавать нечего — на бэкенд ничего не ушло.
      expect(voice.calls, 0);
    });

    testWidgets('отмена: микрофон гаснет, в поле ничего не попадает', (
      tester,
    ) async {
      final recorder = _FakeVoiceRecorder();
      final voice = _FakeVoiceRepository();
      await _pump(tester, _harness(recorder: recorder, voice: voice));
      await tester.pumpAndSettle();

      await tester.tap(find.byType(AppMicButton));
      await tester.pump();
      await tester.tap(_cancelButton);
      await tester.pumpAndSettle();

      expect(recorder.cancelled, isTrue);
      expect(voice.calls, 0);
      expect(find.byType(AppRecordingIndicator), findsNothing);
      expect(find.text('нужен цемент М400, двадцать мешков'), findsNothing);
    });
  });
}
