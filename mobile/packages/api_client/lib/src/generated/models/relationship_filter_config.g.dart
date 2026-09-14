// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'relationship_filter_config.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

RelationshipFilterConfig _$RelationshipFilterConfigFromJson(
  Map<String, dynamic> json,
) => RelationshipFilterConfig(
  entity: json['entity'] as String,
  valueField: json['value_field'] as String,
  displayField: json['display_field'] as String,
  multiple: json['multiple'] as bool,
  endpoint: json['endpoint'] as String,
  filterKey: json['filter_key'] as String?,
);

Map<String, dynamic> _$RelationshipFilterConfigToJson(
  RelationshipFilterConfig instance,
) => <String, dynamic>{
  'entity': instance.entity,
  'value_field': instance.valueField,
  'display_field': instance.displayField,
  'multiple': instance.multiple,
  'endpoint': instance.endpoint,
  'filter_key': ?instance.filterKey,
};
