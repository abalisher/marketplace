// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'base_order_transaction_reference.dart';

part 'base_order_transaction.g.dart';

/// An order transaction's details.
@JsonSerializable()
class BaseOrderTransaction {
  const BaseOrderTransaction({
    required this.id,
    required this.orderId,
    required this.amount,
    required this.currencyCode,
    required this.reference,
    required this.referenceId,
    required this.metadata,
    required this.createdAt,
    required this.updatedAt,
  });

  factory BaseOrderTransaction.fromJson(Map<String, Object?> json) =>
      _$BaseOrderTransactionFromJson(json);

  /// The transaction's ID.
  final String id;

  /// The ID of the order this transaction belongs to.
  @JsonKey(name: 'order_id')
  final String orderId;

  /// The transaction's amount.
  final num amount;

  /// The transaction's currency code.
  @JsonKey(name: 'currency_code')
  final String currencyCode;

  /// The name of a table that this transaction references. If this transaction is for captured payment, its value is `capture`. If this transaction is for refunded payment, its value is `refund`.
  final BaseOrderTransactionReference reference;

  /// The ID of the referenced record in the referenced table.
  @JsonKey(name: 'reference_id')
  final String referenceId;

  /// The transaction's metadata, can hold custom key-value pairs.
  final dynamic metadata;

  /// The date that the transaction was created.
  @JsonKey(name: 'created_at')
  final DateTime createdAt;

  /// The date that the transaction was updated.
  @JsonKey(name: 'updated_at')
  final DateTime updatedAt;

  Map<String, Object?> toJson() => _$BaseOrderTransactionToJson(this);
}
