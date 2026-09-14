// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_post_returns_shipping_req_schema.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AdminPostReturnsShippingReqSchema _$AdminPostReturnsShippingReqSchemaFromJson(
  Map<String, dynamic> json,
) => AdminPostReturnsShippingReqSchema(
  shippingOptionId: json['shipping_option_id'] as String,
  customAmount: json['custom_amount'] as num?,
  description: json['description'] as String?,
  internalNote: json['internal_note'] as String?,
  metadata: json['metadata'],
);

Map<String, dynamic> _$AdminPostReturnsShippingReqSchemaToJson(
  AdminPostReturnsShippingReqSchema instance,
) => <String, dynamic>{
  'shipping_option_id': instance.shippingOptionId,
  'custom_amount': ?instance.customAmount,
  'description': ?instance.description,
  'internal_note': ?instance.internalNote,
  'metadata': ?instance.metadata,
};
