import 'dart:async';

import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../data/voice_exception.dart';
import '../domain/voice_failure.dart';
import '../domain/voice_limits.dart';
import '../domain/voice_recording.dart';
import '../domain/voice_state.dart';
import 'voice_recorder_provider.dart';
import 'voice_repository_provider.dart';

/// Шаг таймера записи: четверть секунды — цифра на экране меняется ровно, без
/// рывков.
const _tick = Duration(milliseconds: 250);

/// Голосовой ввод композера (T10.3): запись → распознавание → текст в поле.
///
/// Ассистенту голос НЕ уходит: расшифровка дописывается в поле ввода, покупатель
/// правит её и отправляет обычным сообщением (требование T11.4). Поэтому текст
/// здесь не хранится — он сразу отдаётся экрану колбэком.
///
/// Два правила, за которые отвечает именно этот контроллер:
///  * запись обрывается на 60 секундах САМА и уходит на распознавание — предел
///    серверный, и терять из-за него минуту речи нельзя;
///  * любая неудача говорит текстом: молчащая кнопка микрофона — худший исход,
///    покупателю остаётся ручной ввод, и он должен об этом узнать.
class VoiceController extends Notifier<VoiceState> {
  Timer? _timer;
  DateTime? _startedAt;
  ValueChanged<String>? _onText;

  /// Запись бросили — расшифровку, которая уже летит, в поле не кладём.
  bool _cancelled = false;

  @override
  VoiceState build() {
    ref.onDispose(_stopTimer);
    return const VoiceState();
  }

  /// Начать запись. [onText] вызывается один раз с распознанным текстом —
  /// экран дописывает его в поле ввода.
  Future<void> start({required ValueChanged<String> onText}) async {
    if (state.isBusy) return;
    _onText = onText;
    _cancelled = false;
    state = const VoiceState(status: VoiceStatus.recording);
    try {
      await ref.read(voiceRecorderProvider).start();
    } on VoiceException catch (error) {
      state = VoiceState(failure: error.failure);
      return;
    } catch (_) {
      state = const VoiceState(failure: VoiceFailure.failed);
      return;
    }
    if (_cancelled) return;
    _startedAt = DateTime.now();
    _timer = Timer.periodic(_tick, (_) => _onTick());
  }

  /// Закончить запись и распознать.
  Future<void> stop() async {
    if (!state.isRecording) return;
    _stopTimer();
    state = state.copyWith(
      status: VoiceStatus.transcribing,
      clearFailure: true,
    );
    VoiceRecording? recording;
    try {
      recording = await ref.read(voiceRecorderProvider).stop();
    } on VoiceException catch (error) {
      state = VoiceState(failure: error.failure);
      return;
    } catch (_) {
      state = const VoiceState(failure: VoiceFailure.failed);
      return;
    }
    if (_cancelled) return;
    if (recording == null) {
      // Нажали и сразу отпустили: записывать было нечего — молча возвращаемся
      // к полю, ошибки тут нет.
      state = const VoiceState();
      return;
    }
    try {
      final transcript = await ref
          .read(voiceRepositoryProvider)
          .transcribe(recording);
      if (_cancelled) return;
      if (transcript.text.isEmpty) {
        // Пустой текст — «не расслышали» (контракт T10.2), а не сбой.
        state = const VoiceState(failure: VoiceFailure.empty);
        return;
      }
      _onText?.call(transcript.text);
      state = const VoiceState();
    } catch (_) {
      if (_cancelled) return;
      state = const VoiceState(failure: VoiceFailure.failed);
    }
  }

  /// Бросить запись или распознавание: в поле не попадёт ничего.
  Future<void> cancel() async {
    _cancelled = true;
    _stopTimer();
    state = const VoiceState();
    await ref.read(voiceRecorderProvider).cancel();
  }

  /// Убрать строку с ошибкой (покупатель её прочитал).
  void dismissFailure() {
    if (state.failure == null) return;
    state = state.copyWith(clearFailure: true);
  }

  void _onTick() {
    final startedAt = _startedAt;
    if (startedAt == null) return;
    final elapsed = DateTime.now().difference(startedAt);
    state = state.copyWith(elapsed: elapsed);
    if (elapsed >= VoiceLimits.maxDuration) {
      unawaited(stop());
    }
  }

  void _stopTimer() {
    _timer?.cancel();
    _timer = null;
    _startedAt = null;
  }
}

/// Провайдер голосового ввода композера.
final voiceControllerProvider = NotifierProvider<VoiceController, VoiceState>(
  VoiceController.new,
);
