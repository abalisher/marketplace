import 'order_document.dart';
import 'order_line.dart';

/// Детали заказа: суммы/состав от ядра + бизнес-статус жизненного цикла (ТЗ),
/// код получения из нашего lifecycle-эндпоинта и документы-основания (счёт/акт).
/// `lifecycleStatus` — сырой код статуса (new|confirmed|assembled|in_delivery|
/// delivered|closed|canceled), локализуется на экране; null — цикл ещё не заведён.
class OrderDetail {
  const OrderDetail({
    required this.id,
    required this.displayNumber,
    required this.total,
    required this.currencyCode,
    required this.lines,
    this.lifecycleStatus,
    this.deliveryCode,
    this.deliveryDate,
    this.deliveryWindow,
    this.documents = const [],
  });

  final String id;
  final String displayNumber;
  final num total;
  final String currencyCode;
  final List<OrderLine> lines;
  final String? lifecycleStatus;

  /// Код получения при доставке (показывается покупателю для приёмки).
  final String? deliveryCode;

  /// Слот доставки (T5.6): календарные сутки Астаны и код окна приезда
  /// (`morning`|`day`|`evening`); null — заказ оформлен до появления слотов.
  final DateTime? deliveryDate;
  final String? deliveryWindow;

  /// Документы-основания заказа (счёт/накладная/АВР); пусто — ещё не выпущены.
  final List<OrderDocument> documents;
}
