// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

part 'store_phone_auth_customer.g.dart';

@JsonSerializable()
class StorePhoneAuthCustomer {
  const StorePhoneAuthCustomer({
    required this.id,
    this.phone,
    this.firstName,
    this.lastName,
    this.email,
  });

  factory StorePhoneAuthCustomer.fromJson(Map<String, Object?> json) =>
      _$StorePhoneAuthCustomerFromJson(json);

  final String id;
  final String? phone;
  @JsonKey(name: 'first_name')
  final String? firstName;
  @JsonKey(name: 'last_name')
  final String? lastName;
  final String? email;

  Map<String, Object?> toJson() => _$StorePhoneAuthCustomerToJson(this);
}
