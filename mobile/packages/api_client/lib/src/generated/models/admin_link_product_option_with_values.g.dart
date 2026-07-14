// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_link_product_option_with_values.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AdminLinkProductOptionWithValues _$AdminLinkProductOptionWithValuesFromJson(
  Map<String, dynamic> json,
) => AdminLinkProductOptionWithValues(
  id: json['id'] as String,
  valueIds: (json['value_ids'] as List<dynamic>)
      .map((e) => e as String)
      .toList(),
);

Map<String, dynamic> _$AdminLinkProductOptionWithValuesToJson(
  AdminLinkProductOptionWithValues instance,
) => <String, dynamic>{'id': instance.id, 'value_ids': instance.valueIds};
