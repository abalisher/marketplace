// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_update_shipping_option_prices_sealed.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

Map<String, dynamic> _$AdminUpdateShippingOptionPricesSealedToJson(
  AdminUpdateShippingOptionPricesSealed instance,
) => <String, dynamic>{};

AdminUpdateShippingOptionPricesSealedAdminUpdateShippingOptionPriceWithCurrency
_$AdminUpdateShippingOptionPricesSealedAdminUpdateShippingOptionPriceWithCurrencyFromJson(
  Map<String, dynamic> json,
) =>
    AdminUpdateShippingOptionPricesSealedAdminUpdateShippingOptionPriceWithCurrency(
      id: json['id'] as String?,
      currencyCode: json['currencyCode'] as String?,
      amount: json['amount'] as num?,
      rules: (json['rules'] as List<dynamic>?)
          ?.map((e) => PriceRule.fromJson(e as Map<String, dynamic>))
          .toList(),
    );

Map<String, dynamic>
_$AdminUpdateShippingOptionPricesSealedAdminUpdateShippingOptionPriceWithCurrencyToJson(
  AdminUpdateShippingOptionPricesSealedAdminUpdateShippingOptionPriceWithCurrency
  instance,
) => <String, dynamic>{
  'id': ?instance.id,
  'currencyCode': ?instance.currencyCode,
  'amount': ?instance.amount,
  'rules': ?instance.rules,
};

AdminUpdateShippingOptionPricesSealedAdminUpdateShippingOptionPriceWithRegion
_$AdminUpdateShippingOptionPricesSealedAdminUpdateShippingOptionPriceWithRegionFromJson(
  Map<String, dynamic> json,
) =>
    AdminUpdateShippingOptionPricesSealedAdminUpdateShippingOptionPriceWithRegion(
      id: json['id'] as String?,
      regionId: json['regionId'] as String?,
      amount: json['amount'] as num?,
      rules: (json['rules'] as List<dynamic>?)
          ?.map((e) => PriceRule.fromJson(e as Map<String, dynamic>))
          .toList(),
    );

Map<String, dynamic>
_$AdminUpdateShippingOptionPricesSealedAdminUpdateShippingOptionPriceWithRegionToJson(
  AdminUpdateShippingOptionPricesSealedAdminUpdateShippingOptionPriceWithRegion
  instance,
) => <String, dynamic>{
  'id': ?instance.id,
  'regionId': ?instance.regionId,
  'amount': ?instance.amount,
  'rules': ?instance.rules,
};
