/// Итог оформленного заказа для экрана подтверждения. Тонкая проекция
/// StoreOrder: номер (человекочитаемый display_id), сумма и валюта (считает
/// бэкенд).
class OrderSummary {
  const OrderSummary({
    required this.orderId,
    required this.displayNumber,
    required this.total,
    required this.currencyCode,
  });

  final String orderId;

  /// Человекочитаемый номер заказа (`#123`); при отсутствии — короткий id.
  final String displayNumber;
  final num total;
  final String currencyCode;
}
