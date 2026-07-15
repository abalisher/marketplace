// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'store_kaspi_payment.dart';

part 'store_kaspi_payment_res.g.dart';

@JsonSerializable()
class StoreKaspiPaymentRes {
  const StoreKaspiPaymentRes({required this.payment});

  factory StoreKaspiPaymentRes.fromJson(Map<String, Object?> json) =>
      _$StoreKaspiPaymentResFromJson(json);

  final StoreKaspiPayment payment;

  Map<String, Object?> toJson() => _$StoreKaspiPaymentResToJson(this);
}
