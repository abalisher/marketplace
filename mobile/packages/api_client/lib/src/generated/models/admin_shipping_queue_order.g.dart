// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_shipping_queue_order.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AdminShippingQueueOrder _$AdminShippingQueueOrderFromJson(
  Map<String, dynamic> json,
) => AdminShippingQueueOrder(
  orderId: json['order_id'] as String,
  orderStatus: AdminShippingQueueOrderOrderStatus.fromJson(
    json['order_status'] as String,
  ),
  stage: AdminShippingQueueOrderStage.fromJson(json['stage'] as String),
  summary: AdminOrderAssemblySummary.fromJson(
    json['summary'] as Map<String, dynamic>,
  ),
  categories: (json['categories'] as List<dynamic>)
      .map((e) => AdminShippingCategoryTile.fromJson(e as Map<String, dynamic>))
      .toList(),
  canShip: json['can_ship'] as bool,
  order: json['order'] == null
      ? null
      : AdminOrderLifecycleOrder.fromJson(
          json['order'] as Map<String, dynamic>,
        ),
  shipTarget: json['ship_target'] == null
      ? null
      : AdminShipTarget.fromJson(json['ship_target'] as Map<String, dynamic>),
);

Map<String, dynamic> _$AdminShippingQueueOrderToJson(
  AdminShippingQueueOrder instance,
) => <String, dynamic>{
  'order_id': instance.orderId,
  'order': ?instance.order,
  'order_status':
      _$AdminShippingQueueOrderOrderStatusEnumMap[instance.orderStatus]!,
  'stage': _$AdminShippingQueueOrderStageEnumMap[instance.stage]!,
  'summary': instance.summary,
  'categories': instance.categories,
  'can_ship': instance.canShip,
  'ship_target': ?instance.shipTarget,
};

const _$AdminShippingQueueOrderOrderStatusEnumMap = {
  AdminShippingQueueOrderOrderStatus.valueNew: 'new',
  AdminShippingQueueOrderOrderStatus.confirmed: 'confirmed',
  AdminShippingQueueOrderOrderStatus.assembling: 'assembling',
  AdminShippingQueueOrderOrderStatus.partiallyAssembled: 'partially_assembled',
  AdminShippingQueueOrderOrderStatus.assembled: 'assembled',
  AdminShippingQueueOrderOrderStatus.$unknown: r'$unknown',
};

const _$AdminShippingQueueOrderStageEnumMap = {
  AdminShippingQueueOrderStage.assembling: 'assembling',
  AdminShippingQueueOrderStage.ready: 'ready',
  AdminShippingQueueOrderStage.shortage: 'shortage',
  AdminShippingQueueOrderStage.$unknown: r'$unknown',
};
