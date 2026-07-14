// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'admin_payment.dart';

part 'admin_payment_response.g.dart';

/// The payment's details.
@JsonSerializable()
class AdminPaymentResponse {
  const AdminPaymentResponse({required this.payment});

  factory AdminPaymentResponse.fromJson(Map<String, Object?> json) =>
      _$AdminPaymentResponseFromJson(json);

  final AdminPayment payment;

  Map<String, Object?> toJson() => _$AdminPaymentResponseToJson(this);
}
