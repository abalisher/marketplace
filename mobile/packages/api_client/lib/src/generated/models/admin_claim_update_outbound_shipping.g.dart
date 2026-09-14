// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_claim_update_outbound_shipping.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AdminClaimUpdateOutboundShipping _$AdminClaimUpdateOutboundShippingFromJson(
  Map<String, dynamic> json,
) => AdminClaimUpdateOutboundShipping(
  customAmount: json['custom_amount'] as num?,
  internalNote: json['internal_note'] as String?,
  metadata: json['metadata'],
);

Map<String, dynamic> _$AdminClaimUpdateOutboundShippingToJson(
  AdminClaimUpdateOutboundShipping instance,
) => <String, dynamic>{
  'custom_amount': ?instance.customAmount,
  'internal_note': ?instance.internalNote,
  'metadata': ?instance.metadata,
};
