// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'error.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

Error _$ErrorFromJson(Map<String, dynamic> json) => Error(
  message: json['message'] as String,
  name: json['name'] as String,
  type: json['type'] as String,
);

Map<String, dynamic> _$ErrorToJson(Error instance) => <String, dynamic>{
  'message': instance.message,
  'name': instance.name,
  'type': instance.type,
};
