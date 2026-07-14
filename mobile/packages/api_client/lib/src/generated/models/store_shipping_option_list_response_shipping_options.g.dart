// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'store_shipping_option_list_response_shipping_options.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

StoreShippingOptionListResponseShippingOptions
_$StoreShippingOptionListResponseShippingOptionsFromJson(
  Map<String, dynamic> json,
) => StoreShippingOptionListResponseShippingOptions(
  id: json['id'] as String,
  name: json['name'] as String,
  priceType: StoreCartShippingOptionPriceType.fromJson(
    json['price_type'] as String,
  ),
  serviceZoneId: json['service_zone_id'] as String,
  providerId: json['provider_id'] as String,
  provider: Provider.fromJson(json['provider'] as Map<String, dynamic>),
  type: Type.fromJson(json['type'] as String),
  shippingProfileId: json['shipping_profile_id'] as String,
  amount: json['amount'] as num,
  data: json['data'],
  prices: (json['prices'] as List<dynamic>)
      .map((e) => StorePrice.fromJson(e as Map<String, dynamic>))
      .toList(),
  calculatedPrice: StoreCalculatedPrice.fromJson(
    json['calculated_price'] as Map<String, dynamic>,
  ),
  insufficientInventory: json['insufficient_inventory'] as bool,
  serviceZone: ServiceZone.fromJson(
    json['service_zone'] as Map<String, dynamic>,
  ),
);

Map<String, dynamic> _$StoreShippingOptionListResponseShippingOptionsToJson(
  StoreShippingOptionListResponseShippingOptions instance,
) => <String, dynamic>{
  'id': instance.id,
  'name': instance.name,
  'price_type': _$StoreCartShippingOptionPriceTypeEnumMap[instance.priceType]!,
  'service_zone_id': instance.serviceZoneId,
  'provider_id': instance.providerId,
  'provider': instance.provider,
  'type': _$TypeEnumMap[instance.type]!,
  'shipping_profile_id': instance.shippingProfileId,
  'amount': instance.amount,
  'data': instance.data,
  'prices': instance.prices,
  'calculated_price': instance.calculatedPrice,
  'insufficient_inventory': instance.insufficientInventory,
  'service_zone': instance.serviceZone,
};

const _$StoreCartShippingOptionPriceTypeEnumMap = {
  StoreCartShippingOptionPriceType.flat: 'flat',
  StoreCartShippingOptionPriceType.calculated: 'calculated',
  StoreCartShippingOptionPriceType.$unknown: r'$unknown',
};

const _$TypeEnumMap = {
  Type.spend: 'spend',
  Type.usage: 'usage',
  Type.$unknown: r'$unknown',
};
