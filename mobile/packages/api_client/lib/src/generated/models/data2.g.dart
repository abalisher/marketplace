// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'data2.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

Data2 _$Data2FromJson(Map<String, dynamic> json) => Data2(
  invoke: (json['invoke'] as Map<String, dynamic>).map(
    (k, e) => MapEntry(k, Invoke.fromJson(e as Map<String, dynamic>)),
  ),
  payload: json['payload'],
);

Map<String, dynamic> _$Data2ToJson(Data2 instance) => <String, dynamic>{
  'invoke': instance.invoke,
  'payload': instance.payload,
};
