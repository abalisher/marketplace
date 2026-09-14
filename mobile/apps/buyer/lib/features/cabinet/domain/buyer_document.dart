/// Документ покупателя в общем списке кабинета (T10.6): счёт, накладная или
/// акт по одному из его заказов. От [OrderDocument] отличается тем, что несёт
/// заказ — список «Документы» существует ровно затем, чтобы найти накладную,
/// не вспоминая, в каком заказе она была.
class BuyerDocument {
  const BuyerDocument({
    required this.id,
    required this.type,
    required this.number,
    required this.orderId,
    this.orderDisplayNumber,
    this.total,
    this.currencyCode,
    this.createdAt,
    this.fileUrl,
  });

  final String id;

  /// Код типа: invoice | waybill | internal_avr (локализуется на экране).
  final String type;

  /// Человекочитаемый номер (напр. «WB-2026-000013»).
  final String number;

  /// Заказ-основание: по нему строка ведёт в карточку заказа.
  final String orderId;

  /// Человекочитаемый номер заказа (`#53`); `null` — бэкенд его не отдал.
  final String? orderDisplayNumber;

  final num? total;
  final String? currencyCode;
  final DateTime? createdAt;

  /// Ссылка на PDF; `null` — файл ещё готовится.
  final String? fileUrl;

  bool get hasFile => fileUrl != null && fileUrl!.isNotEmpty;
}
