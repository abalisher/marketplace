// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

part 'admin_capture_payment.g.dart';

/// The payment's details.
@JsonSerializable()
class AdminCapturePayment {
  const AdminCapturePayment({this.amount});

  factory AdminCapturePayment.fromJson(Map<String, Object?> json) =>
      _$AdminCapturePaymentFromJson(json);

  /// The amount to capture.
  final num? amount;

  Map<String, Object?> toJson() => _$AdminCapturePaymentToJson(this);
}
