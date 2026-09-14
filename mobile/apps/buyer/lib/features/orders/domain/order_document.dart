/// Документ-основание заказа (счёт / накладная / внутренний АВР), видимый
/// покупателю. Файл (PDF) — по [fileUrl] в File Module; `null` — ещё не выпущен
/// (например, акт до доставки). Тип/номер считает бэкенд; экран отображает.
class OrderDocument {
  const OrderDocument({required this.type, required this.number, this.fileUrl});

  /// Код типа: invoice | waybill | internal_avr (локализуется на экране).
  final String type;

  /// Человекочитаемый номер (напр. «INV-2026-000001»).
  final String number;

  /// Ссылка на PDF; `null` — файла ещё нет (документ не выпущен).
  final String? fileUrl;

  bool get hasFile => fileUrl != null && fileUrl!.isNotEmpty;
}
