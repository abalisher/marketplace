// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_shipping_option.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AdminShippingOption _$AdminShippingOptionFromJson(
  Map<String, dynamic> json,
) => AdminShippingOption(
  id: json['id'] as String,
  name: json['name'] as String,
  priceType: AdminShippingOptionPriceType.fromJson(
    json['price_type'] as String,
  ),
  serviceZoneId: json['service_zone_id'] as String,
  serviceZone: json['service_zone'],
  providerId: json['provider_id'] as String,
  provider: AdminFulfillmentProvider.fromJson(
    json['provider'] as Map<String, dynamic>,
  ),
  shippingOptionTypeId: json['shipping_option_type_id'] as String,
  type: AdminShippingOptionType.fromJson(json['type'] as Map<String, dynamic>),
  shippingProfileId: json['shipping_profile_id'] as String,
  shippingProfile: AdminShippingProfile.fromJson(
    json['shipping_profile'] as Map<String, dynamic>,
  ),
  rules: (json['rules'] as List<dynamic>)
      .map((e) => AdminShippingOptionRule.fromJson(e as Map<String, dynamic>))
      .toList(),
  prices: (json['prices'] as List<dynamic>)
      .map((e) => AdminShippingOptionPrice.fromJson(e as Map<String, dynamic>))
      .toList(),
  data: json['data'],
  metadata: json['metadata'],
  createdAt: DateTime.parse(json['created_at'] as String),
  updatedAt: DateTime.parse(json['updated_at'] as String),
  deletedAt: json['deleted_at'] == null
      ? null
      : DateTime.parse(json['deleted_at'] as String),
);

Map<String, dynamic> _$AdminShippingOptionToJson(
  AdminShippingOption instance,
) => <String, dynamic>{
  'id': instance.id,
  'name': instance.name,
  'price_type': _$AdminShippingOptionPriceTypeEnumMap[instance.priceType]!,
  'service_zone_id': instance.serviceZoneId,
  'service_zone': ?instance.serviceZone,
  'provider_id': instance.providerId,
  'provider': instance.provider,
  'shipping_option_type_id': instance.shippingOptionTypeId,
  'type': instance.type,
  'shipping_profile_id': instance.shippingProfileId,
  'shipping_profile': instance.shippingProfile,
  'rules': instance.rules,
  'prices': instance.prices,
  'data': ?instance.data,
  'metadata': ?instance.metadata,
  'created_at': instance.createdAt.toIso8601String(),
  'updated_at': instance.updatedAt.toIso8601String(),
  'deleted_at': ?instance.deletedAt?.toIso8601String(),
};

const _$AdminShippingOptionPriceTypeEnumMap = {
  AdminShippingOptionPriceType.calculated: 'calculated',
  AdminShippingOptionPriceType.flat: 'flat',
  AdminShippingOptionPriceType.$unknown: r'$unknown',
};
