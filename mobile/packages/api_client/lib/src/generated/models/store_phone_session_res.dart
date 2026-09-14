// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'store_phone_auth_customer.dart';

part 'store_phone_session_res.g.dart';

@JsonSerializable()
class StorePhoneSessionRes {
  const StorePhoneSessionRes({
    required this.token,
    required this.customer,
    required this.created,
  });

  factory StorePhoneSessionRes.fromJson(Map<String, Object?> json) =>
      _$StorePhoneSessionResFromJson(json);

  /// Bearer-токен сессии покупателя.
  final String token;
  final StorePhoneAuthCustomer customer;

  /// true — учётка создана этим входом (профиль пока только телефон).
  final bool created;

  Map<String, Object?> toJson() => _$StorePhoneSessionResToJson(this);
}
