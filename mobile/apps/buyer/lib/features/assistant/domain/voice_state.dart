import 'voice_failure.dart';

/// Что делает голосовой ввод прямо сейчас (T10.3).
enum VoiceStatus {
  /// Ничего не пишем — в композере обычное поле.
  idle,

  /// Микрофон слушает: в композере индикатор с таймером и отменой.
  recording,

  /// Запись ушла на распознавание.
  transcribing,
}

/// Состояние голосового ввода композера. Текст расшифровки здесь НЕ живёт: он
/// дописывается в поле ввода, и дальше это обычное сообщение (требование
/// T11.4).
class VoiceState {
  const VoiceState({
    this.status = VoiceStatus.idle,
    this.elapsed = Duration.zero,
    this.failure,
  });

  final VoiceStatus status;

  /// Сколько идёт запись — для таймера «12/60».
  final Duration elapsed;

  /// Последняя неудача; экран показывает её текстом до следующей попытки.
  final VoiceFailure? failure;

  bool get isRecording => status == VoiceStatus.recording;
  bool get isTranscribing => status == VoiceStatus.transcribing;
  bool get isBusy => status != VoiceStatus.idle;

  /// [failure] сбрасывается явно — `clearFailure: true`, иначе прошлая ошибка
  /// осталась бы висеть под композером всю сессию.
  VoiceState copyWith({
    VoiceStatus? status,
    Duration? elapsed,
    VoiceFailure? failure,
    bool clearFailure = false,
  }) {
    return VoiceState(
      status: status ?? this.status,
      elapsed: elapsed ?? this.elapsed,
      failure: clearFailure ? null : (failure ?? this.failure),
    );
  }
}
