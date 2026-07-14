// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'computed.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

Computed _$ComputedFromJson(Map<String, dynamic> json) => Computed(
  type: json['type'] as String,
  requiredFields: (json['required_fields'] as List<dynamic>)
      .map((e) => e as String)
      .toList(),
  optionalFields: (json['optional_fields'] as List<dynamic>)
      .map((e) => e as String)
      .toList(),
);

Map<String, dynamic> _$ComputedToJson(Computed instance) => <String, dynamic>{
  'type': instance.type,
  'required_fields': instance.requiredFields,
  'optional_fields': instance.optionalFields,
};
