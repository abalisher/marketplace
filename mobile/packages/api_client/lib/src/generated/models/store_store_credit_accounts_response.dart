// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'store_store_credit_account.dart';

part 'store_store_credit_accounts_response.g.dart';

/// The paginated list of store credit accounts.
@JsonSerializable()
class StoreStoreCreditAccountsResponse {
  const StoreStoreCreditAccountsResponse({
    required this.limit,
    required this.offset,
    required this.count,
    required this.storeCreditAccounts,
    this.estimateCount,
  });

  factory StoreStoreCreditAccountsResponse.fromJson(
    Map<String, Object?> json,
  ) => _$StoreStoreCreditAccountsResponseFromJson(json);

  /// The maximum number of store credit accounts to return.
  final num limit;

  /// The number of store credit accounts to skip before retrieving the results.
  final num offset;

  /// The total number of store credit accounts available.
  final num count;

  /// The list of store credit accounts.
  @JsonKey(name: 'store_credit_accounts')
  final List<StoreStoreCreditAccount> storeCreditAccounts;

  /// The store credit account's estimate count.
  @JsonKey(name: 'estimate_count')
  final num? estimateCount;

  Map<String, Object?> toJson() =>
      _$StoreStoreCreditAccountsResponseToJson(this);
}
