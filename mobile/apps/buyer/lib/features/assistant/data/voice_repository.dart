import '../domain/voice_recording.dart';
import '../domain/voice_transcript.dart';

/// Граница распознавания речи (T10.3): запись → текст. В тестах подменяется
/// фейком.
///
/// Ход ассистента этот путь НЕ делает: расшифровка падает в композер, покупатель
/// правит её и отправляет обычным сообщением (требование T11.4).
abstract interface class VoiceRepository {
  Future<VoiceTranscript> transcribe(VoiceRecording recording);
}
