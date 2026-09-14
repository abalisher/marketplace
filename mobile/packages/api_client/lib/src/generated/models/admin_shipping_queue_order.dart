// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'admin_order_assembly_summary.dart';
import 'admin_order_lifecycle_order.dart';
import 'admin_ship_target.dart';
import 'admin_shipping_category_tile.dart';
import 'admin_shipping_queue_order_order_status.dart';
import 'admin_shipping_queue_order_stage.dart';

part 'admin_shipping_queue_order.g.dart';

@JsonSerializable()
class AdminShippingQueueOrder {
  const AdminShippingQueueOrder({
    required this.orderId,
    required this.orderStatus,
    required this.stage,
    required this.summary,
    required this.categories,
    required this.canShip,
    this.order,
    this.shipTarget,
  });

  factory AdminShippingQueueOrder.fromJson(Map<String, Object?> json) =>
      _$AdminShippingQueueOrderFromJson(json);

  @JsonKey(name: 'order_id')
  final String orderId;
  final AdminOrderLifecycleOrder? order;
  @JsonKey(name: 'order_status')
  final AdminShippingQueueOrderOrderStatus orderStatus;
  final AdminShippingQueueOrderStage stage;
  final AdminOrderAssemblySummary summary;
  final List<AdminShippingCategoryTile> categories;

  /// Переход «передать водителю» разрешён: сборка окончена, статус заказа это допускает и есть что отгружать.
  @JsonKey(name: 'can_ship')
  final bool canShip;
  @JsonKey(name: 'ship_target')
  final AdminShipTarget? shipTarget;

  Map<String, Object?> toJson() => _$AdminShippingQueueOrderToJson(this);
}
