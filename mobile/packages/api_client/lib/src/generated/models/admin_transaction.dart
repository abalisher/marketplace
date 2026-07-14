// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'admin_store_credit_account.dart';
import 'admin_transaction_type.dart';

part 'admin_transaction.g.dart';

/// The transaction's details.
@JsonSerializable()
class AdminTransaction {
  const AdminTransaction({
    required this.id,
    required this.accountId,
    required this.type,
    required this.amount,
    required this.account,
    required this.metadata,
    required this.createdAt,
    required this.updatedAt,
    this.note,
    this.reference,
    this.referenceId,
  });

  factory AdminTransaction.fromJson(Map<String, Object?> json) =>
      _$AdminTransactionFromJson(json);

  /// The transaction's ID.
  final String id;

  /// The ID of the store credit account that the transaction belongs to.
  @JsonKey(name: 'account_id')
  final String accountId;

  /// The transaction's type.
  final AdminTransactionType type;

  /// The transaction's amount.
  final num amount;
  final AdminStoreCreditAccount account;

  /// The transaction's note.
  final String? note;

  /// The transaction's reference.
  final String? reference;

  /// The transaction's reference ID.
  @JsonKey(name: 'reference_id')
  final String? referenceId;

  /// The transaction's metadata, can hold custom key-value pairs.
  final dynamic metadata;

  /// The date the transaction was created at.
  @JsonKey(name: 'created_at')
  final DateTime createdAt;

  /// The date the transaction was updated at.
  @JsonKey(name: 'updated_at')
  final DateTime updatedAt;

  Map<String, Object?> toJson() => _$AdminTransactionToJson(this);
}
