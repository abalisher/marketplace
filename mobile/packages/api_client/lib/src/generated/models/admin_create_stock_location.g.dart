// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_create_stock_location.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AdminCreateStockLocation _$AdminCreateStockLocationFromJson(
  Map<String, dynamic> json,
) => AdminCreateStockLocation(
  name: json['name'] as String,
  addressId: json['address_id'] as String?,
  address: json['address'] == null
      ? null
      : AdminUpsertStockLocationAddress.fromJson(
          json['address'] as Map<String, dynamic>,
        ),
  metadata: json['metadata'],
);

Map<String, dynamic> _$AdminCreateStockLocationToJson(
  AdminCreateStockLocation instance,
) => <String, dynamic>{
  'name': instance.name,
  'address_id': instance.addressId,
  'address': instance.address,
  'metadata': instance.metadata,
};
