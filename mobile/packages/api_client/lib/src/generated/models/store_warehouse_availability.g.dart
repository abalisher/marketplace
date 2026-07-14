// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'store_warehouse_availability.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

StoreWarehouseAvailability _$StoreWarehouseAvailabilityFromJson(
  Map<String, dynamic> json,
) => StoreWarehouseAvailability(
  id: json['id'] as String,
  name: json['name'] as String,
  available: json['available'] as num,
);

Map<String, dynamic> _$StoreWarehouseAvailabilityToJson(
  StoreWarehouseAvailability instance,
) => <String, dynamic>{
  'id': instance.id,
  'name': instance.name,
  'available': instance.available,
};
