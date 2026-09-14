// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_update_draft_order_action_shipping_method.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AdminUpdateDraftOrderActionShippingMethod
_$AdminUpdateDraftOrderActionShippingMethodFromJson(
  Map<String, dynamic> json,
) => AdminUpdateDraftOrderActionShippingMethod(
  shippingOptionId: json['shipping_option_id'] as String,
  customAmount: json['custom_amount'] as num?,
  description: json['description'] as String?,
  internalNote: json['internal_note'] as String?,
  metadata: json['metadata'],
);

Map<String, dynamic> _$AdminUpdateDraftOrderActionShippingMethodToJson(
  AdminUpdateDraftOrderActionShippingMethod instance,
) => <String, dynamic>{
  'shipping_option_id': instance.shippingOptionId,
  'custom_amount': ?instance.customAmount,
  'description': ?instance.description,
  'internal_note': ?instance.internalNote,
  'metadata': ?instance.metadata,
};
