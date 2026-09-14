import 'chat_attachment.dart';
import 'chat_role.dart';

/// Одно сообщение диалога ассистента — презентационная модель (без DTO API).
/// Экран отображает `content` в пузыре, выравнивая по `role`; под ответом
/// ассистента рисует [attachments] (карточки товара/оплаты/статуса).
class ChatMessage {
  const ChatMessage({
    required this.role,
    required this.content,
    this.attachments = const [],
  });

  final ChatRole role;
  final String content;

  /// Read-only вставки хода (только у ответа ассистента; иначе пусто).
  final List<ChatAttachment> attachments;
}
