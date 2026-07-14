// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'store_fulfillment_address.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

StoreFulfillmentAddress _$StoreFulfillmentAddressFromJson(
  Map<String, dynamic> json,
) => StoreFulfillmentAddress(
  id: json['id'] as String,
  company: json['company'] as String,
  address1: json['address_1'] as String,
  address2: json['address_2'] as String,
  city: json['city'] as String,
  countryCode: json['country_code'] as String,
  province: json['province'] as String,
  postalCode: json['postal_code'] as String,
  phone: json['phone'] as String,
  metadata: json['metadata'],
  createdAt: DateTime.parse(json['created_at'] as String),
  updatedAt: DateTime.parse(json['updated_at'] as String),
  deletedAt: DateTime.parse(json['deleted_at'] as String),
);

Map<String, dynamic> _$StoreFulfillmentAddressToJson(
  StoreFulfillmentAddress instance,
) => <String, dynamic>{
  'id': instance.id,
  'company': instance.company,
  'address_1': instance.address1,
  'address_2': instance.address2,
  'city': instance.city,
  'country_code': instance.countryCode,
  'province': instance.province,
  'postal_code': instance.postalCode,
  'phone': instance.phone,
  'metadata': instance.metadata,
  'created_at': instance.createdAt.toIso8601String(),
  'updated_at': instance.updatedAt.toIso8601String(),
  'deleted_at': instance.deletedAt.toIso8601String(),
};
