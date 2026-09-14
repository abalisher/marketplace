// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_add_return_shipping.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AdminAddReturnShipping _$AdminAddReturnShippingFromJson(
  Map<String, dynamic> json,
) => AdminAddReturnShipping(
  shippingOptionId: json['shipping_option_id'] as String,
  customAmount: json['custom_amount'] as num?,
  description: json['description'] as String?,
  internalNote: json['internal_note'] as String?,
  metadata: json['metadata'],
);

Map<String, dynamic> _$AdminAddReturnShippingToJson(
  AdminAddReturnShipping instance,
) => <String, dynamic>{
  'shipping_option_id': instance.shippingOptionId,
  'custom_amount': ?instance.customAmount,
  'description': ?instance.description,
  'internal_note': ?instance.internalNote,
  'metadata': ?instance.metadata,
};
