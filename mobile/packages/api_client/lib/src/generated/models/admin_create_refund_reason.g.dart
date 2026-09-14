// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_create_refund_reason.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AdminCreateRefundReason _$AdminCreateRefundReasonFromJson(
  Map<String, dynamic> json,
) => AdminCreateRefundReason(
  label: json['label'] as String,
  code: json['code'] as String,
  description: json['description'] as String?,
);

Map<String, dynamic> _$AdminCreateRefundReasonToJson(
  AdminCreateRefundReason instance,
) => <String, dynamic>{
  'label': instance.label,
  'description': ?instance.description,
  'code': instance.code,
};
