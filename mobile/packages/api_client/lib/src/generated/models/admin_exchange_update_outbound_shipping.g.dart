// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_exchange_update_outbound_shipping.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AdminExchangeUpdateOutboundShipping
_$AdminExchangeUpdateOutboundShippingFromJson(Map<String, dynamic> json) =>
    AdminExchangeUpdateOutboundShipping(
      customAmount: json['custom_amount'] as num?,
      internalNote: json['internal_note'] as String?,
      metadata: json['metadata'],
    );

Map<String, dynamic> _$AdminExchangeUpdateOutboundShippingToJson(
  AdminExchangeUpdateOutboundShipping instance,
) => <String, dynamic>{
  'custom_amount': ?instance.customAmount,
  'internal_note': ?instance.internalNote,
  'metadata': ?instance.metadata,
};
