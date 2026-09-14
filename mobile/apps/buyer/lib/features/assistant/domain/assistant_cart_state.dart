import 'cart_event.dart';
import 'cart_summary.dart';

/// Состояние корзины чата на экране (T10.15). Отдельно от [ChatState]: корзину
/// теперь меняют ДВА пути — счётчики «−/+» (без хода модели) и сам ассистент, —
/// и её состав перестал быть частью хода диалога.
class AssistantCartState {
  const AssistantCartState({
    this.cart = const CartSummary.empty(),
    this.quantities = const {},
    this.events = const [],
    this.isBusy = false,
    this.hasError = false,
  });

  /// Состав по данным сервера — для полосы корзины и итога.
  final CartSummary cart;

  /// Что показывать на счётчиках: серверные количества, поверх которых лежат
  /// ещё не отправленные нажатия (оптимистичный показ).
  final Map<String, int> quantities;

  /// Отметки о нажатиях в ленте — по одной на позицию, последняя переписывает.
  final List<CartEvent> events;

  /// Идёт запись в корзину.
  final bool isBusy;

  /// Последняя запись не прошла — счётчики откачены к подтверждённым цифрам.
  final bool hasError;

  AssistantCartState copyWith({
    CartSummary? cart,
    Map<String, int>? quantities,
    List<CartEvent>? events,
    bool? isBusy,
    bool? hasError,
  }) {
    return AssistantCartState(
      cart: cart ?? this.cart,
      quantities: quantities ?? this.quantities,
      events: events ?? this.events,
      isBusy: isBusy ?? this.isBusy,
      hasError: hasError ?? this.hasError,
    );
  }
}
