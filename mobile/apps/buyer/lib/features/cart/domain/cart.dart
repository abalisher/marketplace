import 'cart_line.dart';

/// Корзина — тонкая презентационная модель. Идентификатор [id] контроллер хранит
/// между операциями; итог [total] считает бэкенд (клиент только отображает).
class Cart {
  const Cart({
    required this.id,
    required this.lines,
    required this.total,
    required this.currencyCode,
  });

  /// Идентификатор корзины.
  final String id;

  /// Строки корзины.
  final List<CartLine> lines;

  /// Итоговая сумма после скидок/бонусов, с налогами (считает бэкенд).
  final num total;

  /// Код валюты корзины.
  final String currencyCode;

  /// Суммарное количество единиц во всех строках (для бейджа корзины).
  int get itemCount => lines.fold(0, (sum, line) => sum + line.quantity);

  /// Пуста ли корзина.
  bool get isEmpty => lines.isEmpty;
}
