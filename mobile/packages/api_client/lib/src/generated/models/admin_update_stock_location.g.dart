// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_update_stock_location.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AdminUpdateStockLocation _$AdminUpdateStockLocationFromJson(
  Map<String, dynamic> json,
) => AdminUpdateStockLocation(
  name: json['name'] as String?,
  address: json['address'] == null
      ? null
      : AdminUpsertStockLocationAddress.fromJson(
          json['address'] as Map<String, dynamic>,
        ),
  addressId: json['address_id'] as String?,
  metadata: json['metadata'],
);

Map<String, dynamic> _$AdminUpdateStockLocationToJson(
  AdminUpdateStockLocation instance,
) => <String, dynamic>{
  'name': instance.name,
  'address': instance.address,
  'address_id': instance.addressId,
  'metadata': instance.metadata,
};
