import '../domain/chat_file_failure.dart';

/// Выбор вложения не удался (T10.4c). Несёт ПРИЧИНУ [ChatFileFailure], а не
/// текст: сообщение выбирает экран, тексты локализованы.
class ChatFileException implements Exception {
  const ChatFileException(this.failure);

  final ChatFileFailure failure;

  @override
  String toString() => 'ChatFileException: ${failure.name}';
}
