// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'admin_transaction.dart';

part 'admin_transactions_response.g.dart';

/// The paginated list of transactions.
@JsonSerializable()
class AdminTransactionsResponse {
  const AdminTransactionsResponse({
    required this.limit,
    required this.offset,
    required this.count,
    required this.transactions,
    this.estimateCount,
  });

  factory AdminTransactionsResponse.fromJson(Map<String, Object?> json) =>
      _$AdminTransactionsResponseFromJson(json);

  /// The maximum number of transactions to return.
  final num limit;

  /// The number of transactions to skip before retrieving the results.
  final num offset;

  /// The total number of transactions available.
  final num count;

  /// The list of transactions.
  final List<AdminTransaction> transactions;

  /// The store credit account's estimate count.
  @JsonKey(name: 'estimate_count')
  final num? estimateCount;

  Map<String, Object?> toJson() => _$AdminTransactionsResponseToJson(this);
}
