/// Строка состава заказа — проекция StoreOrderLineItem. Сумму строки считает
/// бэкенд.
class OrderLine {
  const OrderLine({
    required this.title,
    required this.quantity,
    required this.total,
    required this.currencyCode,
  });

  final String title;
  final int quantity;
  final num total;
  final String currencyCode;
}
