// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_claim_add_outbound_shipping.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AdminClaimAddOutboundShipping _$AdminClaimAddOutboundShippingFromJson(
  Map<String, dynamic> json,
) => AdminClaimAddOutboundShipping(
  shippingOptionId: json['shipping_option_id'] as String,
  customAmount: json['custom_amount'] as num?,
  description: json['description'] as String?,
  internalNote: json['internal_note'] as String?,
  metadata: json['metadata'],
);

Map<String, dynamic> _$AdminClaimAddOutboundShippingToJson(
  AdminClaimAddOutboundShipping instance,
) => <String, dynamic>{
  'shipping_option_id': instance.shippingOptionId,
  'custom_amount': instance.customAmount,
  'description': instance.description,
  'internal_note': instance.internalNote,
  'metadata': instance.metadata,
};
