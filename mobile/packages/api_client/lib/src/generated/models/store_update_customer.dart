// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

part 'store_update_customer.g.dart';

/// The details to update in the customer.
@JsonSerializable()
class StoreUpdateCustomer {
  const StoreUpdateCustomer({
    this.companyName,
    this.firstName,
    this.lastName,
    this.phone,
    this.metadata,
  });

  factory StoreUpdateCustomer.fromJson(Map<String, Object?> json) =>
      _$StoreUpdateCustomerFromJson(json);

  /// The customer's company name.
  @JsonKey(name: 'company_name')
  final String? companyName;

  /// The customer's first name.
  @JsonKey(name: 'first_name')
  final String? firstName;

  /// The customer's last name.
  @JsonKey(name: 'last_name')
  final String? lastName;

  /// The customer's phone.
  final String? phone;

  /// The customer's metadata, can hold custom key-value pairs.
  final dynamic metadata;

  Map<String, Object?> toJson() => _$StoreUpdateCustomerToJson(this);
}
