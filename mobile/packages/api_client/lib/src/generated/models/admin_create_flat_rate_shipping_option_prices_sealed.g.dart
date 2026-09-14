// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_create_flat_rate_shipping_option_prices_sealed.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

Map<String, dynamic> _$AdminCreateFlatRateShippingOptionPricesSealedToJson(
  AdminCreateFlatRateShippingOptionPricesSealed instance,
) => <String, dynamic>{};

AdminCreateFlatRateShippingOptionPricesSealedVariant1
_$AdminCreateFlatRateShippingOptionPricesSealedVariant1FromJson(
  Map<String, dynamic> json,
) => AdminCreateFlatRateShippingOptionPricesSealedVariant1(
  currencyCode: json['currencyCode'] as String,
  amount: json['amount'] as num,
  rules: (json['rules'] as List<dynamic>?)
      ?.map((e) => Rules.fromJson(e as Map<String, dynamic>))
      .toList(),
);

Map<String, dynamic>
_$AdminCreateFlatRateShippingOptionPricesSealedVariant1ToJson(
  AdminCreateFlatRateShippingOptionPricesSealedVariant1 instance,
) => <String, dynamic>{
  'currencyCode': instance.currencyCode,
  'amount': instance.amount,
  'rules': ?instance.rules,
};

AdminCreateFlatRateShippingOptionPricesSealedVariant2
_$AdminCreateFlatRateShippingOptionPricesSealedVariant2FromJson(
  Map<String, dynamic> json,
) => AdminCreateFlatRateShippingOptionPricesSealedVariant2(
  regionId: json['regionId'] as String,
  amount: json['amount'] as num,
  rules: (json['rules'] as List<dynamic>?)
      ?.map((e) => Rules2.fromJson(e as Map<String, dynamic>))
      .toList(),
);

Map<String, dynamic>
_$AdminCreateFlatRateShippingOptionPricesSealedVariant2ToJson(
  AdminCreateFlatRateShippingOptionPricesSealedVariant2 instance,
) => <String, dynamic>{
  'regionId': instance.regionId,
  'amount': instance.amount,
  'rules': ?instance.rules,
};
