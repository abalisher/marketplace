// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_exchange_update_inbound_shipping.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AdminExchangeUpdateInboundShipping _$AdminExchangeUpdateInboundShippingFromJson(
  Map<String, dynamic> json,
) => AdminExchangeUpdateInboundShipping(
  customAmount: json['custom_amount'] as num?,
  internalNote: json['internal_note'] as String?,
  metadata: json['metadata'],
);

Map<String, dynamic> _$AdminExchangeUpdateInboundShippingToJson(
  AdminExchangeUpdateInboundShipping instance,
) => <String, dynamic>{
  'custom_amount': instance.customAmount,
  'internal_note': instance.internalNote,
  'metadata': instance.metadata,
};
