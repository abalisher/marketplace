// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_add_exchange_inbound_items.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AdminAddExchangeInboundItems _$AdminAddExchangeInboundItemsFromJson(
  Map<String, dynamic> json,
) => AdminAddExchangeInboundItems(
  items: (json['items'] as List<dynamic>?)
      ?.map((e) => Items4.fromJson(e as Map<String, dynamic>))
      .toList(),
  locationId: json['location_id'] as String?,
);

Map<String, dynamic> _$AdminAddExchangeInboundItemsToJson(
  AdminAddExchangeInboundItems instance,
) => <String, dynamic>{
  'items': instance.items,
  'location_id': instance.locationId,
};
