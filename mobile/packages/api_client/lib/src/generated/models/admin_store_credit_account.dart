// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'admin_customer.dart';

part 'admin_store_credit_account.g.dart';

/// The store credit account's details.
@JsonSerializable()
class AdminStoreCreditAccount {
  const AdminStoreCreditAccount({
    required this.customer,
    required this.id,
    required this.currencyCode,
    required this.credits,
    required this.debits,
    required this.balance,
    required this.metadata,
    required this.createdAt,
    required this.updatedAt,
    this.customerId,
    this.code,
  });

  factory AdminStoreCreditAccount.fromJson(Map<String, Object?> json) =>
      _$AdminStoreCreditAccountFromJson(json);

  final AdminCustomer customer;

  /// The store credit account's ID.
  final String id;

  /// The ID of the customer that the store credit account belongs to.
  @JsonKey(name: 'customer_id')
  final String? customerId;

  /// The store credit account's currency code.
  @JsonKey(name: 'currency_code')
  final String currencyCode;

  /// The account's credits.
  final num credits;

  /// The account's debits.
  final num debits;

  /// The account's balance.
  final num balance;

  /// The store credit account's metadata, can hold custom key-value pairs.
  final dynamic metadata;

  /// The date the store credit account was created at.
  @JsonKey(name: 'created_at')
  final DateTime createdAt;

  /// The date the store credit account was updated at.
  @JsonKey(name: 'updated_at')
  final DateTime updatedAt;

  /// The store credit account's code.
  final String? code;

  Map<String, Object?> toJson() => _$AdminStoreCreditAccountToJson(this);
}
