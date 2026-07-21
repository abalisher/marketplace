// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'admin_cash_payment.dart';

part 'admin_cash_payment_res.g.dart';

@JsonSerializable()
class AdminCashPaymentRes {
  const AdminCashPaymentRes({required this.payment});

  factory AdminCashPaymentRes.fromJson(Map<String, Object?> json) =>
      _$AdminCashPaymentResFromJson(json);

  final AdminCashPayment payment;

  Map<String, Object?> toJson() => _$AdminCashPaymentResToJson(this);
}
