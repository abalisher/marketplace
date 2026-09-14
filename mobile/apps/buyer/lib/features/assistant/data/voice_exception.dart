import '../domain/voice_failure.dart';

/// Голосовой ввод не сработал (T10.3). Несёт ПРИЧИНУ [VoiceFailure], а не
/// текст: сообщение выбирает экран, тексты локализованы.
class VoiceException implements Exception {
  const VoiceException(this.failure);

  final VoiceFailure failure;

  @override
  String toString() => 'VoiceException: ${failure.name}';
}
