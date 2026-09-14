// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_create_flat_rate_shipping_option.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AdminCreateFlatRateShippingOption _$AdminCreateFlatRateShippingOptionFromJson(
  Map<String, dynamic> json,
) => AdminCreateFlatRateShippingOption(
  name: json['name'] as String,
  serviceZoneId: json['service_zone_id'] as String,
  shippingProfileId: json['shipping_profile_id'] as String,
  priceType: AdminCreateFlatRateShippingOptionPriceType.fromJson(
    json['price_type'] as String,
  ),
  providerId: json['provider_id'] as String,
  prices: (json['prices'] as List<dynamic>)
      .map(
        (e) => AdminCreateFlatRateShippingOptionPricesSealed.fromJson(
          e as Map<String, dynamic>,
        ),
      )
      .toList(),
  data: json['data'],
  type: json['type'] == null
      ? null
      : AdminCreateShippingOptionType.fromJson(
          json['type'] as Map<String, dynamic>,
        ),
  typeId: json['type_id'] as String?,
  rules: (json['rules'] as List<dynamic>?)
      ?.map(
        (e) =>
            AdminCreateShippingOptionRule.fromJson(e as Map<String, dynamic>),
      )
      .toList(),
  metadata: json['metadata'],
);

Map<String, dynamic> _$AdminCreateFlatRateShippingOptionToJson(
  AdminCreateFlatRateShippingOption instance,
) => <String, dynamic>{
  'name': instance.name,
  'service_zone_id': instance.serviceZoneId,
  'shipping_profile_id': instance.shippingProfileId,
  'data': ?instance.data,
  'price_type':
      _$AdminCreateFlatRateShippingOptionPriceTypeEnumMap[instance.priceType]!,
  'provider_id': instance.providerId,
  'type': ?instance.type,
  'prices': instance.prices,
  'type_id': ?instance.typeId,
  'rules': ?instance.rules,
  'metadata': ?instance.metadata,
};

const _$AdminCreateFlatRateShippingOptionPriceTypeEnumMap = {
  AdminCreateFlatRateShippingOptionPriceType.flat: 'flat',
  AdminCreateFlatRateShippingOptionPriceType.calculated: 'calculated',
  AdminCreateFlatRateShippingOptionPriceType.$unknown: r'$unknown',
};
