// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'base_order_fulfillment.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

BaseOrderFulfillment _$BaseOrderFulfillmentFromJson(
  Map<String, dynamic> json,
) => BaseOrderFulfillment(
  id: json['id'] as String,
  locationId: json['location_id'] as String,
  packedAt: DateTime.parse(json['packed_at'] as String),
  shippedAt: DateTime.parse(json['shipped_at'] as String),
  deliveredAt: DateTime.parse(json['delivered_at'] as String),
  canceledAt: DateTime.parse(json['canceled_at'] as String),
  data: json['data'],
  providerId: json['provider_id'] as String,
  shippingOptionId: json['shipping_option_id'] as String,
  metadata: json['metadata'],
  createdAt: DateTime.parse(json['created_at'] as String),
  updatedAt: DateTime.parse(json['updated_at'] as String),
  requiresShipping: json['requires_shipping'] as bool,
  createdBy: json['created_by'] as String,
  markedShippedBy: json['marked_shipped_by'] as String,
);

Map<String, dynamic> _$BaseOrderFulfillmentToJson(
  BaseOrderFulfillment instance,
) => <String, dynamic>{
  'id': instance.id,
  'location_id': instance.locationId,
  'packed_at': instance.packedAt.toIso8601String(),
  'shipped_at': instance.shippedAt.toIso8601String(),
  'delivered_at': instance.deliveredAt.toIso8601String(),
  'canceled_at': instance.canceledAt.toIso8601String(),
  'data': instance.data,
  'provider_id': instance.providerId,
  'shipping_option_id': instance.shippingOptionId,
  'metadata': instance.metadata,
  'created_at': instance.createdAt.toIso8601String(),
  'updated_at': instance.updatedAt.toIso8601String(),
  'requires_shipping': instance.requiresShipping,
  'created_by': instance.createdBy,
  'marked_shipped_by': instance.markedShippedBy,
};
