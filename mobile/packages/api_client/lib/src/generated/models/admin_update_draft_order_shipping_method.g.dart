// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_update_draft_order_shipping_method.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AdminUpdateDraftOrderShippingMethod
_$AdminUpdateDraftOrderShippingMethodFromJson(Map<String, dynamic> json) =>
    AdminUpdateDraftOrderShippingMethod(
      shippingOptionId: json['shipping_option_id'] as String?,
      customAmount: json['custom_amount'] as num?,
      internalNote: json['internal_note'] as String?,
    );

Map<String, dynamic> _$AdminUpdateDraftOrderShippingMethodToJson(
  AdminUpdateDraftOrderShippingMethod instance,
) => <String, dynamic>{
  'shipping_option_id': ?instance.shippingOptionId,
  'custom_amount': ?instance.customAmount,
  'internal_note': ?instance.internalNote,
};
