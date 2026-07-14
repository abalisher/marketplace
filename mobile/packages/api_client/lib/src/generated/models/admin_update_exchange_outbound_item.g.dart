// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_update_exchange_outbound_item.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AdminUpdateExchangeOutboundItem _$AdminUpdateExchangeOutboundItemFromJson(
  Map<String, dynamic> json,
) => AdminUpdateExchangeOutboundItem(
  quantity: json['quantity'] as num?,
  internalNote: json['internal_note'] as String?,
);

Map<String, dynamic> _$AdminUpdateExchangeOutboundItemToJson(
  AdminUpdateExchangeOutboundItem instance,
) => <String, dynamic>{
  'quantity': instance.quantity,
  'internal_note': instance.internalNote,
};
