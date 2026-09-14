import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../domain/order_detail.dart';
import '../domain/order_list_item.dart';
import 'orders_repository_provider.dart';

/// Список заказов текущего покупателя.
final ordersProvider = FutureProvider<List<OrderListItem>>((ref) {
  return ref.watch(ordersRepositoryProvider).fetchOrders();
});

/// Детали заказа по id.
final orderDetailProvider = FutureProvider.family<OrderDetail, String>((
  ref,
  orderId,
) {
  return ref.watch(ordersRepositoryProvider).fetchOrder(orderId);
});
