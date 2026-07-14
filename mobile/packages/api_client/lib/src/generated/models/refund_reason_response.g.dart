// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'refund_reason_response.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

RefundReasonResponse _$RefundReasonResponseFromJson(
  Map<String, dynamic> json,
) => RefundReasonResponse(
  refundReason: AdminRefundReason.fromJson(
    json['refund_reason'] as Map<String, dynamic>,
  ),
);

Map<String, dynamic> _$RefundReasonResponseToJson(
  RefundReasonResponse instance,
) => <String, dynamic>{'refund_reason': instance.refundReason};
