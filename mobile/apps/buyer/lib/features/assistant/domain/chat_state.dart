import 'chat_file.dart';
import 'chat_message.dart';

/// Состояние экрана чата. Всю бизнес-логику (подбор/корзина/оплата/трекинг)
/// ведёт бэкенд; клиент лишь хранит историю и токены между ходами и статус
/// текущего запроса.
class ChatState {
  const ChatState({
    this.messages = const [],
    this.cartId,
    this.orderId,
    this.conversationId,
    this.isSending = false,
    this.hasError = false,
    this.streamingText = '',
    this.sentFiles = const {},
  });

  /// История диалога в порядке отображения (старые сверху).
  final List<ChatMessage> messages;

  /// Токен корзины, удерживаемый между ходами (получен из ответа бэкенда).
  final String? cartId;

  /// Токен оформленного заказа, удерживаемый между ходами.
  final String? orderId;

  /// Локальный id диалога в истории на устройстве (T2.5); null — диалог ещё не
  /// сохранён (пустой/новый). Присваивается на первом успешном ходе.
  final String? conversationId;

  /// Идёт ли обмен с ассистентом (ждём ответ на последнюю реплику).
  final bool isSending;

  /// Не удался ли последний ход — экран показывает баннер повтора.
  final bool hasError;

  /// Текст ответа, который печатается ПРЯМО СЕЙЧАС (стриминг, T10.1d). Пустая
  /// строка при [isSending] — ход начался, но первый фрагмент ещё не пришёл
  /// (экран показывает «печатает…»). Между ходами всегда пуст: дописанный ответ
  /// живёт в [messages].
  final String streamingText;

  /// Вложения ОТПРАВЛЕННЫХ реплик покупателя (T10.4c): индекс реплики в
  /// [messages] → приложенные к ней файлы. Держим их отдельно от [ChatMessage]
  /// по двум причинам: бэкенд возвращает историю целиком и вложений в ней нет
  /// (файл живёт ровно один ход), а в сохранённую историю диалога они и не
  /// должны попадать — три кадра по 8 МБ выбили бы хранилище устройства вместе
  /// со всеми диалогами. Поэтому превью живёт в ПАМЯТИ: возобновлённый из
  /// истории диалог показывает текст реплики без снимка.
  final Map<int, List<ChatFile>> sentFiles;

  /// Меняет только историю/флаги/печатаемый текст; токены корзины/заказа и id
  /// диалога сохраняются.
  ChatState copyWith({
    List<ChatMessage>? messages,
    bool? isSending,
    bool? hasError,
    String? streamingText,
    Map<int, List<ChatFile>>? sentFiles,
  }) {
    return ChatState(
      messages: messages ?? this.messages,
      cartId: cartId,
      orderId: orderId,
      conversationId: conversationId,
      isSending: isSending ?? this.isSending,
      hasError: hasError ?? this.hasError,
      streamingText: streamingText ?? this.streamingText,
      sentFiles: sentFiles ?? this.sentFiles,
    );
  }
}
