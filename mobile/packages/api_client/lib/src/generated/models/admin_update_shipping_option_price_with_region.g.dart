// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_update_shipping_option_price_with_region.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AdminUpdateShippingOptionPriceWithRegion
_$AdminUpdateShippingOptionPriceWithRegionFromJson(Map<String, dynamic> json) =>
    AdminUpdateShippingOptionPriceWithRegion(
      id: json['id'] as String?,
      regionId: json['region_id'] as String?,
      amount: json['amount'] as num?,
      rules: (json['rules'] as List<dynamic>?)
          ?.map((e) => PriceRule.fromJson(e as Map<String, dynamic>))
          .toList(),
    );

Map<String, dynamic> _$AdminUpdateShippingOptionPriceWithRegionToJson(
  AdminUpdateShippingOptionPriceWithRegion instance,
) => <String, dynamic>{
  'id': instance.id,
  'region_id': instance.regionId,
  'amount': instance.amount,
  'rules': instance.rules,
};
