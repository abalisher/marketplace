import 'chat_message.dart';
import 'chat_role.dart';

/// Сохранённый диалог с ассистентом (локальная история на устройстве, T2.5).
/// Бэкенд остаётся stateless — история живёт только у клиента: тексты реплик +
/// удерживаемые токены сессии (cartId/orderId), чтобы возобновлённый диалог мог
/// продолжить корзину/трекинг. Read-only вставки хода (карточки товара/оплаты)
/// НЕ сохраняем — они эфемерны и приходят только на живой ход; при возобновлении
/// лента показывает текст, вставки появятся на следующем ответе ассистента.
class ChatConversation {
  const ChatConversation({
    required this.id,
    required this.title,
    required this.updatedAt,
    required this.messages,
    this.cartId,
    this.orderId,
    this.titleCustom = false,
  });

  /// Локальный идентификатор диалога (микросекундная метка создания).
  final String id;

  /// Заголовок для списка истории — первая реплика покупателя (обрезанная) либо
  /// имя, которое покупатель задал сам ([titleCustom]).
  final String title;

  /// Момент последнего изменения — для сортировки истории (свежие сверху).
  final DateTime updatedAt;

  final List<ChatMessage> messages;
  final String? cartId;
  final String? orderId;

  /// Переименован ли диалог покупателем (T10.1c). Автозаголовок по первой
  /// реплике такое имя не перетирает.
  final bool titleCustom;

  /// Подходит ли диалог поисковому запросу рельса: сравниваем и название, и
  /// текст реплик, регистронезависимо. Пустой запрос подходит всем.
  bool matches(String query) {
    final needle = query.trim().toLowerCase();
    if (needle.isEmpty) return true;
    if (title.toLowerCase().contains(needle)) return true;
    return messages.any((m) => m.content.toLowerCase().contains(needle));
  }

  /// Копия с новым названием, помеченным как заданное покупателем.
  ChatConversation renamed(String newTitle) => ChatConversation(
    id: id,
    title: newTitle,
    updatedAt: updatedAt,
    messages: messages,
    cartId: cartId,
    orderId: orderId,
    titleCustom: true,
  );

  Map<String, dynamic> toJson() => {
    'id': id,
    'title': title,
    'updated_at': updatedAt.toIso8601String(),
    if (titleCustom) 'title_custom': true,
    if (cartId != null) 'cart_id': cartId,
    if (orderId != null) 'order_id': orderId,
    'messages': messages
        .map(
          (m) => {
            'role': m.role == ChatRole.user ? 'user' : 'assistant',
            'content': m.content,
          },
        )
        .toList(),
  };

  static ChatConversation fromJson(Map<String, dynamic> json) {
    final rawMessages = (json['messages'] as List? ?? const [])
        .whereType<Map<String, dynamic>>();
    return ChatConversation(
      id: json['id'] as String,
      title: (json['title'] as String?) ?? '',
      updatedAt:
          DateTime.tryParse(json['updated_at'] as String? ?? '') ??
          DateTime.fromMillisecondsSinceEpoch(0),
      cartId: json['cart_id'] as String?,
      orderId: json['order_id'] as String?,
      titleCustom: json['title_custom'] == true,
      messages: rawMessages
          .map(
            (m) => ChatMessage(
              role: m['role'] == 'user' ? ChatRole.user : ChatRole.assistant,
              content: (m['content'] as String?) ?? '',
            ),
          )
          .toList(),
    );
  }
}
