// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_add_exchange_outbound_items.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AdminAddExchangeOutboundItems _$AdminAddExchangeOutboundItemsFromJson(
  Map<String, dynamic> json,
) => AdminAddExchangeOutboundItems(
  items: (json['items'] as List<dynamic>?)
      ?.map((e) => Items5.fromJson(e as Map<String, dynamic>))
      .toList(),
);

Map<String, dynamic> _$AdminAddExchangeOutboundItemsToJson(
  AdminAddExchangeOutboundItems instance,
) => <String, dynamic>{'items': ?instance.items};
