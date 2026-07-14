// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_return_reason_response.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AdminReturnReasonResponse _$AdminReturnReasonResponseFromJson(
  Map<String, dynamic> json,
) => AdminReturnReasonResponse(
  returnReason: AdminReturnReason.fromJson(
    json['return_reason'] as Map<String, dynamic>,
  ),
);

Map<String, dynamic> _$AdminReturnReasonResponseToJson(
  AdminReturnReasonResponse instance,
) => <String, dynamic>{'return_reason': instance.returnReason};
