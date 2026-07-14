// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

part 'admin_create_store_credit_account.g.dart';

/// The details of the store credit account to create.
@JsonSerializable()
class AdminCreateStoreCreditAccount {
  const AdminCreateStoreCreditAccount({
    required this.currencyCode,
    this.customerId,
    this.metadata,
  });

  factory AdminCreateStoreCreditAccount.fromJson(Map<String, Object?> json) =>
      _$AdminCreateStoreCreditAccountFromJson(json);

  /// The store credit account's currency code.
  @JsonKey(name: 'currency_code')
  final String currencyCode;

  /// The ID of the customer that the store credit account belongs to.
  @JsonKey(name: 'customer_id')
  final String? customerId;

  /// The store credit account's metadata, can hold custom key-value pairs.
  final dynamic metadata;

  Map<String, Object?> toJson() => _$AdminCreateStoreCreditAccountToJson(this);
}
