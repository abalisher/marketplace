import 'cart_line.dart';

/// Состав корзины чата (T10.15). Приходит двумя путями: ответом на нажатие
/// счётчика и отдельным чтением после хода модели (корзину меняет и ассистент).
class CartSummary {
  const CartSummary({
    required this.cartId,
    required this.currency,
    required this.items,
    required this.total,
  });

  /// Пустая корзина: id ещё нет (до первого «+»).
  const CartSummary.empty()
    : cartId = null,
      currency = 'kzt',
      items = const [],
      total = 0;

  final String? cartId;
  final String currency;
  final List<CartLine> items;

  /// Итог в тенге.
  final int total;

  bool get isEmpty => items.isEmpty;

  /// Количества по вариантам — на них стоят счётчики карточек.
  Map<String, int> get quantities => {
    for (final line in items) line.variantId: line.quantity,
  };
}
