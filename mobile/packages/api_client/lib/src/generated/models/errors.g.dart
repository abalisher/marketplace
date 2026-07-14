// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'errors.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

Errors _$ErrorsFromJson(Map<String, dynamic> json) => Errors(
  error: json['error'],
  action: json['action'] as String,
  handlerType: json['handlerType'] as String,
);

Map<String, dynamic> _$ErrorsToJson(Errors instance) => <String, dynamic>{
  'error': instance.error,
  'action': instance.action,
  'handlerType': instance.handlerType,
};
