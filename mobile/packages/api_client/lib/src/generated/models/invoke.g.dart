// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'invoke.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

Invoke _$InvokeFromJson(Map<String, dynamic> json) => Invoke(
  output: json['output'] == null
      ? null
      : Output.fromJson(json['output'] as Map<String, dynamic>),
);

Map<String, dynamic> _$InvokeToJson(Invoke instance) => <String, dynamic>{
  'output': ?instance.output,
};
