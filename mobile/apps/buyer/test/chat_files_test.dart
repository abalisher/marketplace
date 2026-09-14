import 'dart:convert';
import 'dart:typed_data';

import 'package:core/auth/auth_controller.dart';
import 'package:core/auth/auth_customer.dart';
import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:ui_kit/app_attachment_chip.dart';
import 'package:ui_kit/app_icon_button.dart';
import 'package:ui_kit/app_theme.dart';

import 'package:marketplace_buyer/features/assistant/chat_file_selection.dart';
import 'package:marketplace_buyer/features/assistant/data/assistant_repository.dart';
import 'package:marketplace_buyer/features/assistant/data/chat_file_exception.dart';
import 'package:marketplace_buyer/features/assistant/data/chat_file_picker.dart';
import 'package:marketplace_buyer/features/assistant/data/medusa_assistant_repository.dart';
import 'package:marketplace_buyer/features/assistant/domain/assistant_reply.dart';
import 'package:marketplace_buyer/features/assistant/domain/chat_file.dart';
import 'package:marketplace_buyer/features/assistant/domain/chat_file_failure.dart';
import 'package:marketplace_buyer/features/assistant/domain/chat_file_source.dart';
import 'package:marketplace_buyer/features/assistant/domain/chat_message.dart';
import 'package:marketplace_buyer/features/assistant/domain/chat_role.dart';
import 'package:marketplace_buyer/features/assistant/domain/picked_chat_file.dart';
import 'package:marketplace_buyer/features/assistant/providers/assistant_repository_provider.dart';
import 'package:marketplace_buyer/features/assistant/providers/chat_file_picker_provider.dart';
import 'package:marketplace_buyer/features/assistant/providers/chat_history_store_provider.dart';
import 'package:marketplace_buyer/features/assistant/screens/chat_screen.dart';
import 'no_assistant_cart.dart';
import 'no_assistant_stream.dart';

/// Настоящий PNG 1×1: превью в чипе и в пузыре рисует декодер, и мусорные байты
/// дали бы вместо картинки ошибку.
final _png = base64Decode(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk'
  '+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
);

PickedChatFile _picked({
  String name = 'list.png',
  String mimeType = 'image/png',
  int size = 0,
}) => PickedChatFile(
  name: name,
  mimeType: mimeType,
  bytes: size == 0 ? _png : Uint8List(size),
);

var _ids = 0;
String _nextId() => 'file-${_ids++}';

/// Фейк системного выбора: ни камеры, ни файлового менеджера в тестовой среде
/// нет — граница [ChatFilePicker] и есть точка подмены.
class _FakeChatFilePicker implements ChatFilePicker {
  _FakeChatFilePicker({this.picked = const [], this.failure});

  final List<PickedChatFile> picked;
  final ChatFileFailure? failure;

  ChatFileSource? lastSource;
  int calls = 0;

  @override
  Future<List<PickedChatFile>> pick(ChatFileSource source) async {
    calls++;
    lastSource = source;
    if (failure != null) throw ChatFileException(failure!);
    return picked;
  }
}

/// Ассистент, который запоминает ход: важно, что именно ушло вместе с репликой.
class _RecordingAssistantRepository
    with NoAssistantStream, NoAssistantCart
    implements AssistantRepository {
  int calls = 0;
  List<ChatFile> lastFiles = const [];
  String lastText = '';

  @override
  Future<AssistantReply> send({
    required List<ChatMessage> history,
    String? cartId,
    String? orderId,
    List<ChatFile> files = const [],
  }) async {
    calls++;
    lastFiles = files;
    lastText = history.last.content;
    return AssistantReply(
      messages: [
        ...history,
        const ChatMessage(
          role: ChatRole.assistant,
          content: 'Разобрал список: цемент М400, 20 мешков',
        ),
      ],
    );
  }
}

/// Фейковый адаптер Dio: отдаёт заготовленный JSON и запоминает тело запроса.
class _FakeAdapter implements HttpClientAdapter {
  Map<String, dynamic>? lastRequestBody;

  @override
  Future<ResponseBody> fetch(
    RequestOptions options,
    Stream<List<int>>? requestStream,
    Future<void>? cancelFuture,
  ) async {
    lastRequestBody = options.data as Map<String, dynamic>?;
    return ResponseBody.fromString(
      jsonEncode({
        'messages': [
          {'role': 'user', 'content': ''},
          {'role': 'assistant', 'content': 'Вижу список'},
        ],
      }),
      200,
      headers: {
        Headers.contentTypeHeader: [Headers.jsonContentType],
      },
    );
  }

  @override
  void close({bool force = false}) {}
}

late SharedPreferences _prefs;

class _GuestAuthController extends AuthController {
  @override
  Future<AuthCustomer?> build() async => null;
}

Widget _harness({
  required ChatFilePicker picker,
  required AssistantRepository assistant,
}) {
  return ProviderScope(
    overrides: [
      assistantRepositoryProvider.overrideWithValue(assistant),
      chatFilePickerProvider.overrideWithValue(picker),
      authControllerProvider.overrideWith(_GuestAuthController.new),
      sharedPreferencesProvider.overrideWithValue(_prefs),
    ],
    child: MaterialApp(theme: buildAppTheme(), home: const ChatScreen()),
  );
}

Future<void> _pump(WidgetTester tester, Widget app) async {
  tester.view.physicalSize = const Size(412, 892);
  tester.view.devicePixelRatio = 1.0;
  addTearDown(tester.view.reset);
  await tester.pumpWidget(app);
  await tester.pumpAndSettle();
}

/// Скрепка композера: круглая кнопка-иконка со скрепкой (у микрофона и отмены
/// свои иконки).
final _attachButton = find.widgetWithIcon(
  AppIconButton,
  Icons.attach_file_rounded,
);

/// Пройти путь «скрепка → лист источников → камера».
Future<void> _attachFromCamera(WidgetTester tester) async {
  await tester.tap(_attachButton);
  await tester.pumpAndSettle();
  await tester.tap(find.text('Сделать фото'));
  await tester.pumpAndSettle();
}

void main() {
  setUp(() async {
    _ids = 0;
    SharedPreferences.setMockInitialValues({});
    _prefs = await SharedPreferences.getInstance();
  });

  group('Отсев вложений (правила бэкенда на клиенте)', () {
    test('фото и PDF принимаются, тип приводится к серверному', () {
      final selection = acceptChatFiles(
        current: const [],
        picked: [
          _picked(name: 'IMG_1.JPG', mimeType: 'IMAGE/JPEG; charset=binary'),
          // Файловый менеджер не сообщил тип — решает расширение.
          _picked(name: 'смета.pdf', mimeType: ''),
        ],
        nextId: _nextId,
      );
      expect(selection.failure, isNull);
      expect(selection.files.map((f) => f.mimeType), [
        'image/jpeg',
        'application/pdf',
      ]);
      expect(selection.files.last.isImage, isFalse);
    });

    test('таблица отказывается ОТДЕЛЬНО от неизвестного формата', () {
      // Покупателю есть что сделать прямо сейчас: снять лист на камеру или
      // продиктовать голосом — и текст отказа должен вести именно туда (T11.1).
      final byType = acceptChatFiles(
        current: const [],
        picked: [
          _picked(
            name: 'смета',
            mimeType:
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          ),
        ],
        nextId: _nextId,
      );
      expect(byType.failure, ChatFileFailure.table);

      final byExtension = acceptChatFiles(
        current: const [],
        picked: [_picked(name: 'смета.xlsx', mimeType: '')],
        nextId: _nextId,
      );
      expect(byExtension.failure, ChatFileFailure.table);

      final unknown = acceptChatFiles(
        current: const [],
        picked: [_picked(name: 'клип.mp4', mimeType: 'video/mp4')],
        nextId: _nextId,
      );
      expect(unknown.failure, ChatFileFailure.type);
    });

    test('годные файлы из выбора берём, даже если один негоден', () {
      // Три кадра листа не теряются из-за случайно захваченного видео.
      final selection = acceptChatFiles(
        current: const [],
        picked: [
          _picked(name: 'лист1.png'),
          _picked(name: 'клип.mp4', mimeType: 'video/mp4'),
          _picked(name: 'лист2.png'),
        ],
        nextId: _nextId,
      );
      expect(selection.files.map((f) => f.name), ['лист1.png', 'лист2.png']);
      expect(selection.failure, ChatFileFailure.type);
    });

    test('пределы: файл 8 МБ, ход 12 МБ, три файла за раз', () {
      final tooLarge = acceptChatFiles(
        current: const [],
        picked: [_picked(size: ChatFile.maxFileBytes + 1)],
        nextId: _nextId,
      );
      expect(tooLarge.failure, ChatFileFailure.tooLarge);
      expect(tooLarge.files, isEmpty);

      final turn = acceptChatFiles(
        current: const [],
        picked: [
          _picked(name: 'a.png', size: 7 * 1024 * 1024),
          _picked(name: 'b.png', size: 7 * 1024 * 1024),
        ],
        nextId: _nextId,
      );
      expect(turn.failure, ChatFileFailure.turnTooLarge);
      expect(turn.files.map((f) => f.name), ['a.png']);

      final tooMany = acceptChatFiles(
        current: const [],
        picked: [
          _picked(name: 'a.png'),
          _picked(name: 'b.png'),
          _picked(name: 'c.png'),
          _picked(name: 'd.png'),
        ],
        nextId: _nextId,
      );
      expect(tooMany.failure, ChatFileFailure.tooMany);
      expect(tooMany.files.length, ChatFile.maxFilesPerTurn);
    });
  });

  group('Вложение в теле хода', () {
    test(
      'files уходят base64 с типом и именем; между ходами не тянутся',
      () async {
        final adapter = _FakeAdapter();
        final dio = Dio(BaseOptions(baseUrl: 'http://localhost:9000'))
          ..httpClientAdapter = adapter;
        final repository = MedusaAssistantRepository(dio);

        await repository.send(
          history: const [ChatMessage(role: ChatRole.user, content: '')],
          files: [
            ChatFile(
              id: 'f1',
              name: 'список.png',
              mimeType: 'image/png',
              bytes: _png,
            ),
          ],
        );
        final withFiles = adapter.lastRequestBody!['files'] as List;
        expect(withFiles.single, {
          'mime_type': 'image/png',
          'data': base64Encode(_png),
          'name': 'список.png',
        });
        // Пустой текст реплики допустим: снимок без подписи — сообщение.
        expect((adapter.lastRequestBody!['messages'] as List).single, {
          'role': 'user',
          'content': '',
        });

        await repository.send(
          history: const [
            ChatMessage(role: ChatRole.user, content: 'а сколько'),
          ],
        );
        expect(adapter.lastRequestBody!.containsKey('files'), isFalse);
      },
    );
  });

  group('Скрепка в композере', () {
    testWidgets('снимок с камеры встаёт чипом над полем и уходит с репликой', (
      tester,
    ) async {
      final picker = _FakeChatFilePicker(picked: [_picked(name: 'лист.png')]);
      final assistant = _RecordingAssistantRepository();
      await _pump(tester, _harness(picker: picker, assistant: assistant));

      expect(find.byType(AppAttachmentChip), findsNothing);
      await _attachFromCamera(tester);

      expect(picker.lastSource, ChatFileSource.camera);
      expect(find.byType(AppAttachmentChip), findsOneWidget);
      expect(find.text('лист.png'), findsOneWidget);

      // Отправка БЕЗ текста: снимок листа без подписи — нормальное сообщение.
      await tester.tap(find.bySemanticsLabel('Отправить'));
      await tester.pumpAndSettle();

      expect(assistant.calls, 1);
      expect(assistant.lastText, '');
      expect(assistant.lastFiles.single.name, 'лист.png');
      // Набор снят: следующий ход вложение не потащит.
      expect(find.byType(AppAttachmentChip), findsNothing);
      expect(
        find.text('Разобрал список: цемент М400, 20 мешков'),
        findsOneWidget,
      );
    });

    testWidgets(
      'диалог из истории: снимок без подписи не оставляет пустой пузырь',
      (tester) async {
        // Превью живёт в памяти, история его не хранит — на месте реплики
        // должна стоять подпись, а не пустой пузырь (он читался бы как сбой).
        final picker = _FakeChatFilePicker(picked: [_picked(name: 'лист.png')]);
        final assistant = _RecordingAssistantRepository();
        await _pump(tester, _harness(picker: picker, assistant: assistant));

        await _attachFromCamera(tester);
        await tester.tap(find.bySemanticsLabel('Отправить'));
        await tester.pumpAndSettle();

        // Возобновляем тот же диалог из локальной истории.
        await tester.tap(find.byIcon(Icons.menu));
        await tester.pumpAndSettle();
        // Тот же текст есть и в ленте под drawer — берём строку рельса.
        await tester.tap(
          find.descendant(
            of: find.byType(Drawer),
            matching: find.text('Разобрал список: цемент М400, 20 мешков'),
          ),
        );
        await tester.pumpAndSettle();

        expect(find.text('Вложение'), findsOneWidget);
      },
    );

    testWidgets('крестик убирает вложение до отправки', (tester) async {
      final picker = _FakeChatFilePicker(picked: [_picked(name: 'лист.png')]);
      final assistant = _RecordingAssistantRepository();
      await _pump(tester, _harness(picker: picker, assistant: assistant));

      await _attachFromCamera(tester);
      expect(find.byType(AppAttachmentChip), findsOneWidget);

      await tester.tap(find.bySemanticsLabel('Убрать вложение: лист.png'));
      await tester.pumpAndSettle();

      expect(find.byType(AppAttachmentChip), findsNothing);
      // Отправлять снова нечего — пустое поле без вложения не уходит.
      expect(assistant.calls, 0);
    });

    testWidgets('отказ называет причину и не отнимает ручной ввод', (
      tester,
    ) async {
      final picker = _FakeChatFilePicker(
        picked: [_picked(name: 'смета.xlsx', mimeType: '')],
      );
      await _pump(
        tester,
        _harness(picker: picker, assistant: _RecordingAssistantRepository()),
      );

      await _attachFromCamera(tester);

      expect(
        find.text(
          'Таблицы и документы Word пока не читаем. Сфотографируйте лист '
          'или продиктуйте позиции голосом',
        ),
        findsOneWidget,
      );
      expect(find.byType(AppAttachmentChip), findsNothing);
    });

    testWidgets('отказ в доступе к камере объясняется текстом', (tester) async {
      final picker = _FakeChatFilePicker(failure: ChatFileFailure.denied);
      await _pump(
        tester,
        _harness(picker: picker, assistant: _RecordingAssistantRepository()),
      );

      await _attachFromCamera(tester);

      expect(
        find.text(
          'Нет доступа к камере и фото. Разрешите его в настройках — '
          'или приложите файл',
        ),
        findsOneWidget,
      );
    });
  });
}
