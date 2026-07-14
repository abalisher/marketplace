// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_update_refund_reason.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AdminUpdateRefundReason _$AdminUpdateRefundReasonFromJson(
  Map<String, dynamic> json,
) => AdminUpdateRefundReason(
  label: json['label'] as String?,
  description: json['description'] as String?,
  code: json['code'] as String?,
);

Map<String, dynamic> _$AdminUpdateRefundReasonToJson(
  AdminUpdateRefundReason instance,
) => <String, dynamic>{
  'label': instance.label,
  'description': instance.description,
  'code': instance.code,
};
