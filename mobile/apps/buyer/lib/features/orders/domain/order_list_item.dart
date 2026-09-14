/// Заказ в списке «Мои заказы» — тонкая проекция StoreOrder. Суммы/номер/
/// количество позиций считает бэкенд; экран отображает. Бизнес-статус
/// (жизненного цикла) подтягивается параллельно (список личный — заказов у
/// покупателя немного), `null` — цикл не заведён/недоступен.
class OrderListItem {
  const OrderListItem({
    required this.id,
    required this.displayNumber,
    required this.total,
    required this.currencyCode,
    required this.createdAt,
    required this.itemCount,
    this.lifecycleStatus,
    this.deliveryDate,
    this.deliveryWindow,
  });

  final String id;

  /// Человекочитаемый номер (`#123`); при отсутствии — короткий id.
  final String displayNumber;
  final num total;
  final String currencyCode;
  final DateTime createdAt;

  /// Число позиций в заказе (для меты «N позиций»).
  final int itemCount;

  /// Код бизнес-статуса (new|confirmed|assembled|in_delivery|delivered|closed|
  /// canceled); `null` — цикл недоступен.
  final String? lifecycleStatus;

  /// Слот доставки (T5.6a): в списке покупатель видит, когда ждать машину, не
  /// открывая заказ. null — слота у заказа нет.
  final DateTime? deliveryDate;
  final String? deliveryWindow;

  /// Активный заказ (ещё в работе) — для фильтра «Активные». Доставленные,
  /// закрытые и отменённые — завершённые. Неизвестный статус считаем активным
  /// (лучше показать в «Активных», чем спрятать).
  bool get isActive => switch (lifecycleStatus) {
    'delivered' || 'closed' || 'canceled' => false,
    _ => true,
  };
}
