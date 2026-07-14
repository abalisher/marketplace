// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_create_shipping_option_type.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AdminCreateShippingOptionType _$AdminCreateShippingOptionTypeFromJson(
  Map<String, dynamic> json,
) => AdminCreateShippingOptionType(
  label: json['label'] as String,
  code: json['code'] as String,
  description: json['description'] as String?,
);

Map<String, dynamic> _$AdminCreateShippingOptionTypeToJson(
  AdminCreateShippingOptionType instance,
) => <String, dynamic>{
  'label': instance.label,
  'description': instance.description,
  'code': instance.code,
};
