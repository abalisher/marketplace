// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'admin_refund_reason.dart';

part 'refund_reason_response.g.dart';

/// The refund reason's details.
@JsonSerializable()
class RefundReasonResponse {
  const RefundReasonResponse({required this.refundReason});

  factory RefundReasonResponse.fromJson(Map<String, Object?> json) =>
      _$RefundReasonResponseFromJson(json);

  @JsonKey(name: 'refund_reason')
  final AdminRefundReason refundReason;

  Map<String, Object?> toJson() => _$RefundReasonResponseToJson(this);
}
