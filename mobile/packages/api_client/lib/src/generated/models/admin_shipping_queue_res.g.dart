// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_shipping_queue_res.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AdminShippingQueueRes _$AdminShippingQueueResFromJson(
  Map<String, dynamic> json,
) => AdminShippingQueueRes(
  shippingOrders: (json['shipping_orders'] as List<dynamic>)
      .map((e) => AdminShippingQueueOrder.fromJson(e as Map<String, dynamic>))
      .toList(),
  counts: AdminShippingQueueCounts.fromJson(
    json['counts'] as Map<String, dynamic>,
  ),
  count: json['count'] as num,
  offset: json['offset'] as num,
  limit: json['limit'] as num,
  scanCap: json['scan_cap'] as num,
);

Map<String, dynamic> _$AdminShippingQueueResToJson(
  AdminShippingQueueRes instance,
) => <String, dynamic>{
  'shipping_orders': instance.shippingOrders,
  'counts': instance.counts,
  'count': instance.count,
  'offset': instance.offset,
  'limit': instance.limit,
  'scan_cap': instance.scanCap,
};
