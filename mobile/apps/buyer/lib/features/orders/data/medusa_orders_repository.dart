import 'package:api_client/api_client.dart'
    show
        MedusaStoreApi,
        StoreMyOrderLifecycle,
        StoreOrder,
        StoreOrderDocument,
        StoreOrderLineItem;

import '../domain/order_detail.dart';
import '../domain/order_document.dart';
import '../domain/order_line.dart';
import '../domain/order_list_item.dart';
import 'orders_repository.dart';

/// Реализация [OrdersRepository] поверх Medusa Store API. Список/детали заказа —
/// ядровые `/store/orders[/{id}]`; бизнес-статус (ТЗ) — наш
/// `/store/orders/{id}/lifecycle` (отдельным запросом, отсутствие цикла не
/// ломает показ деталей).
class MedusaOrdersRepository implements OrdersRepository {
  MedusaOrdersRepository(this._api, this._publishableKey);

  final MedusaStoreApi _api;
  final String _publishableKey;

  @override
  Future<List<OrderListItem>> fetchOrders() async {
    final response = await _api.orders.getOrders(
      xPublishableApiKey: _publishableKey,
    );
    // Бизнес-статусы для бейджа/фильтра и слот доставки берём ОДНИМ запросом
    // (`/store/order-lifecycles`, T10.6a): раньше на каждый заказ уходил свой
    // запрос за циклом. Недоступный список → циклы пустые, заказы не прячем.
    final lifecycles = await _lifecycles();
    final items = response.orders
        .map((order) => _toListItem(order, lifecycles[order.id]))
        .toList();
    // Новые сверху (устойчивый порядок вне зависимости от порядка бэкенда).
    items.sort((a, b) => b.createdAt.compareTo(a.createdAt));
    return items;
  }

  /// Жизненные циклы всех заказов покупателя: order_id → цикл (стадия и слот
  /// доставки для строки списка).
  Future<Map<String, StoreMyOrderLifecycle>> _lifecycles() async {
    try {
      final response = await _api.orders.storeListMyOrderLifecycles(
        xPublishableApiKey: _publishableKey,
      );
      return {
        for (final lifecycle in response.lifecycles)
          lifecycle.orderId: lifecycle,
      };
    } catch (_) {
      return const {};
    }
  }

  @override
  Future<OrderDetail> fetchOrder(String orderId) async {
    final response = await _api.orders.getOrdersId(
      id: orderId,
      xPublishableApiKey: _publishableKey,
    );
    final order = response.order;

    String? lifecycleStatus;
    String? deliveryCode;
    DateTime? deliveryDate;
    String? deliveryWindow;
    try {
      final lifecycle = await _api.orders.getOrdersIdLifecycle(
        id: orderId,
        xPublishableApiKey: _publishableKey,
      );
      lifecycleStatus = lifecycle.status;
      deliveryCode = lifecycle.deliveryCode;
      deliveryDate = lifecycle.deliveryDate;
      deliveryWindow = lifecycle.deliveryWindow?.json;
    } catch (_) {
      // Жизненный цикл не заведён/недоступен — детали показываем без статуса.
    }

    // Документы-основания (счёт/акт) — отдельным запросом; отсутствие/ошибка
    // не ломают показ деталей (документы просто не показываем).
    var documents = const <OrderDocument>[];
    try {
      final docsResponse = await _api.orders.storeGetOrderDocuments(
        id: orderId,
        xPublishableApiKey: _publishableKey,
      );
      documents = docsResponse.documents.map(_toDocument).toList();
    } catch (_) {
      // Документы недоступны — блок не показываем.
    }

    return OrderDetail(
      id: order.id,
      displayNumber: _displayNumber(order),
      total: order.total,
      currencyCode: order.currencyCode,
      lifecycleStatus: lifecycleStatus,
      deliveryCode: deliveryCode,
      deliveryDate: deliveryDate,
      deliveryWindow: deliveryWindow,
      documents: documents,
      lines: order.items
          .map((item) => _toLine(item, order.currencyCode))
          .toList(),
    );
  }

  OrderDocument _toDocument(StoreOrderDocument doc) {
    return OrderDocument(
      type: doc.type.json ?? doc.type.name,
      number: doc.number,
      fileUrl: doc.fileUrl,
    );
  }

  OrderListItem _toListItem(
    StoreOrder order,
    StoreMyOrderLifecycle? lifecycle,
  ) {
    final itemCount = order.items.fold<int>(
      0,
      (sum, it) => sum + it.quantity.toInt(),
    );
    return OrderListItem(
      id: order.id,
      displayNumber: _displayNumber(order),
      total: order.total,
      currencyCode: order.currencyCode,
      createdAt: order.createdAt,
      itemCount: itemCount,
      lifecycleStatus: lifecycle?.status,
      deliveryDate: lifecycle?.deliveryDate,
      deliveryWindow: lifecycle?.deliveryWindow?.json,
    );
  }

  OrderLine _toLine(StoreOrderLineItem item, String currencyCode) {
    return OrderLine(
      title: item.productTitle,
      quantity: item.quantity.toInt(),
      total: item.total,
      currencyCode: currencyCode,
    );
  }

  String _displayNumber(StoreOrder order) {
    final displayId = order.displayId;
    return displayId == null ? order.id : '#${displayId.toInt()}';
  }
}
