// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'store_variant_availability.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

StoreVariantAvailability _$StoreVariantAvailabilityFromJson(
  Map<String, dynamic> json,
) => StoreVariantAvailability(
  id: json['id'] as String,
  cities: (json['cities'] as List<dynamic>)
      .map((e) => StoreCityAvailability.fromJson(e as Map<String, dynamic>))
      .toList(),
  title: json['title'] as String?,
  sku: json['sku'] as String?,
);

Map<String, dynamic> _$StoreVariantAvailabilityToJson(
  StoreVariantAvailability instance,
) => <String, dynamic>{
  'id': instance.id,
  'title': ?instance.title,
  'sku': ?instance.sku,
  'cities': instance.cities,
};
