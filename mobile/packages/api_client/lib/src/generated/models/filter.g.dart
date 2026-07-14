// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'filter.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

Filter _$FilterFromJson(Map<String, dynamic> json) => Filter(
  enabled: json['enabled'] as bool,
  operators: (json['operators'] as List<dynamic>?)
      ?.map((e) => e as String)
      .toList(),
  enumValues: (json['enumValues'] as List<dynamic>?)
      ?.map((e) => e as String)
      .toList(),
  relationship: json['relationship'] == null
      ? null
      : RelationshipFilterConfig.fromJson(
          json['relationship'] as Map<String, dynamic>,
        ),
);

Map<String, dynamic> _$FilterToJson(Filter instance) => <String, dynamic>{
  'enabled': instance.enabled,
  'operators': instance.operators,
  'enumValues': instance.enumValues,
  'relationship': instance.relationship,
};
