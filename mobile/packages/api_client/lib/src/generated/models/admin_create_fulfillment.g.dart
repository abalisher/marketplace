// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_create_fulfillment.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AdminCreateFulfillment _$AdminCreateFulfillmentFromJson(
  Map<String, dynamic> json,
) => AdminCreateFulfillment(
  locationId: json['location_id'] as String,
  providerId: json['provider_id'] as String,
  deliveryAddress: AdminFulfillmentDeliveryAddress.fromJson(
    json['delivery_address'] as Map<String, dynamic>,
  ),
  items: (json['items'] as List<dynamic>)
      .map(
        (e) => AdminCreateFulfillmentItem.fromJson(e as Map<String, dynamic>),
      )
      .toList(),
  labels: (json['labels'] as List<dynamic>)
      .map(
        (e) => AdminCreateFulfillmentLabel.fromJson(e as Map<String, dynamic>),
      )
      .toList(),
  orderId: json['order_id'] as String,
  shippingOptionId: json['shipping_option_id'] as String?,
  data: json['data'],
  packedAt: json['packed_at'] == null
      ? null
      : DateTime.parse(json['packed_at'] as String),
  shippedAt: json['shipped_at'] == null
      ? null
      : DateTime.parse(json['shipped_at'] as String),
  deliveredAt: json['delivered_at'] == null
      ? null
      : DateTime.parse(json['delivered_at'] as String),
  canceledAt: json['canceled_at'] == null
      ? null
      : DateTime.parse(json['canceled_at'] as String),
  metadata: json['metadata'],
);

Map<String, dynamic> _$AdminCreateFulfillmentToJson(
  AdminCreateFulfillment instance,
) => <String, dynamic>{
  'location_id': instance.locationId,
  'provider_id': instance.providerId,
  'delivery_address': instance.deliveryAddress,
  'items': instance.items,
  'labels': instance.labels,
  'order_id': instance.orderId,
  'shipping_option_id': ?instance.shippingOptionId,
  'data': ?instance.data,
  'packed_at': ?instance.packedAt?.toIso8601String(),
  'shipped_at': ?instance.shippedAt?.toIso8601String(),
  'delivered_at': ?instance.deliveredAt?.toIso8601String(),
  'canceled_at': ?instance.canceledAt?.toIso8601String(),
  'metadata': ?instance.metadata,
};
