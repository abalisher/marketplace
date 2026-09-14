/// Позиция корзины чата (T10.15): что покупатель набрал счётчиками «−/+» или
/// что положил туда ассистент. Цены — в тенге целыми, как отдаёт бэкенд.
class CartLine {
  const CartLine({
    required this.variantId,
    required this.title,
    required this.quantity,
    required this.unitPrice,
    required this.total,
  });

  final String variantId;
  final String title;
  final int quantity;
  final int unitPrice;
  final int total;
}
