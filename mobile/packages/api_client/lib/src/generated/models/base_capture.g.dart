// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'base_capture.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

BaseCapture _$BaseCaptureFromJson(Map<String, dynamic> json) => BaseCapture(
  id: json['id'] as String,
  amount: json['amount'] as num,
  createdAt: DateTime.parse(json['created_at'] as String),
  payment: json['payment'],
  createdBy: json['created_by'] as String?,
);

Map<String, dynamic> _$BaseCaptureToJson(BaseCapture instance) =>
    <String, dynamic>{
      'id': instance.id,
      'amount': instance.amount,
      'created_at': instance.createdAt.toIso8601String(),
      'created_by': ?instance.createdBy,
      'payment': ?instance.payment,
    };
