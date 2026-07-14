// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_update_shipping_option.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AdminUpdateShippingOption _$AdminUpdateShippingOptionFromJson(
  Map<String, dynamic> json,
) => AdminUpdateShippingOption(
  name: json['name'] as String?,
  data: json['data'],
  priceType: json['price_type'] == null
      ? null
      : AdminUpdateShippingOptionPriceType.fromJson(
          json['price_type'] as String,
        ),
  providerId: json['provider_id'] as String?,
  shippingProfileId: json['shipping_profile_id'] as String?,
  type: json['type'] == null
      ? null
      : AdminCreateShippingOptionType.fromJson(
          json['type'] as Map<String, dynamic>,
        ),
  typeId: json['type_id'] as String?,
  prices: (json['prices'] as List<dynamic>?)
      ?.map(
        (e) => AdminUpdateShippingOptionPricesSealed.fromJson(
          e as Map<String, dynamic>,
        ),
      )
      .toList(),
  rules: (json['rules'] as List<dynamic>?)
      ?.map(
        (e) => AdminUpdateShippingOptionRulesSealed.fromJson(
          e as Map<String, dynamic>,
        ),
      )
      .toList(),
  metadata: json['metadata'],
);

Map<String, dynamic> _$AdminUpdateShippingOptionToJson(
  AdminUpdateShippingOption instance,
) => <String, dynamic>{
  'name': instance.name,
  'data': instance.data,
  'price_type': _$AdminUpdateShippingOptionPriceTypeEnumMap[instance.priceType],
  'provider_id': instance.providerId,
  'shipping_profile_id': instance.shippingProfileId,
  'type': instance.type,
  'type_id': instance.typeId,
  'prices': instance.prices,
  'rules': instance.rules,
  'metadata': instance.metadata,
};

const _$AdminUpdateShippingOptionPriceTypeEnumMap = {
  AdminUpdateShippingOptionPriceType.flat: 'flat',
  AdminUpdateShippingOptionPriceType.calculated: 'calculated',
  AdminUpdateShippingOptionPriceType.$unknown: r'$unknown',
};
