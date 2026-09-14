import '../domain/order_detail.dart';
import '../domain/order_list_item.dart';

/// Контракт заказов покупателя. Реализация по умолчанию — поверх Medusa
/// (список/детали от ядра + бизнес-статус из нашего lifecycle-эндпоинта);
/// в тестах переопределяется фейком. Заказы авторизованного покупателя —
/// токен сессии добавляет общий Dio-интерцептор (`core`).
abstract interface class OrdersRepository {
  /// Список заказов текущего покупателя (новые сверху).
  Future<List<OrderListItem>> fetchOrders();

  /// Детали заказа + бизнес-статус жизненного цикла.
  Future<OrderDetail> fetchOrder(String orderId);
}
