// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_claim_update_inbound_shipping.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AdminClaimUpdateInboundShipping _$AdminClaimUpdateInboundShippingFromJson(
  Map<String, dynamic> json,
) => AdminClaimUpdateInboundShipping(
  customAmount: json['custom_amount'] as num?,
  internalNote: json['internal_note'] as String?,
  metadata: json['metadata'],
);

Map<String, dynamic> _$AdminClaimUpdateInboundShippingToJson(
  AdminClaimUpdateInboundShipping instance,
) => <String, dynamic>{
  'custom_amount': instance.customAmount,
  'internal_note': instance.internalNote,
  'metadata': instance.metadata,
};
