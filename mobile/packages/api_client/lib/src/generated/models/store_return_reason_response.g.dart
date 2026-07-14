// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'store_return_reason_response.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

StoreReturnReasonResponse _$StoreReturnReasonResponseFromJson(
  Map<String, dynamic> json,
) => StoreReturnReasonResponse(
  returnReason: StoreReturnReason.fromJson(
    json['return_reason'] as Map<String, dynamic>,
  ),
);

Map<String, dynamic> _$StoreReturnReasonResponseToJson(
  StoreReturnReasonResponse instance,
) => <String, dynamic>{'return_reason': instance.returnReason};
