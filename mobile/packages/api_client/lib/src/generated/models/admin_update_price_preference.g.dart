// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_update_price_preference.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AdminUpdatePricePreference _$AdminUpdatePricePreferenceFromJson(
  Map<String, dynamic> json,
) => AdminUpdatePricePreference(
  attribute: json['attribute'] as String?,
  value: json['value'] as String?,
  isTaxInclusive: json['is_tax_inclusive'] as bool?,
);

Map<String, dynamic> _$AdminUpdatePricePreferenceToJson(
  AdminUpdatePricePreference instance,
) => <String, dynamic>{
  'attribute': instance.attribute,
  'value': instance.value,
  'is_tax_inclusive': instance.isTaxInclusive,
};
