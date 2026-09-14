/// Расшифровка голосового сообщения (T10.3): то, что вернул
/// `POST /store/assistant/transcribe`.
///
/// Пустой [text] — не ошибка, а «не расслышали»: клиент говорит об этом текстом
/// и оставляет ручной ввод (контракт T10.2).
class VoiceTranscript {
  const VoiceTranscript({required this.text, required this.language});

  final String text;

  /// Язык, на котором говорил покупатель (`ru`/`kk`/`en`) — по определению
  /// модели. Экран его не показывает: пригодится прогону T10.5.
  final String language;
}
