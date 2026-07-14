// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'admin_store_credit_account.dart';

part 'admin_store_credit_accounts_response.g.dart';

/// The paginated list of store credit accounts.
@JsonSerializable()
class AdminStoreCreditAccountsResponse {
  const AdminStoreCreditAccountsResponse({
    required this.limit,
    required this.offset,
    required this.count,
    required this.storeCreditAccounts,
    this.estimateCount,
  });

  factory AdminStoreCreditAccountsResponse.fromJson(
    Map<String, Object?> json,
  ) => _$AdminStoreCreditAccountsResponseFromJson(json);

  /// The maximum number of store credit accounts to return.
  final num limit;

  /// The number of store credit accounts to skip before retrieving the results.
  final num offset;

  /// The total number of store credit accounts available.
  final num count;

  /// The list of store credit accounts.
  @JsonKey(name: 'store_credit_accounts')
  final List<AdminStoreCreditAccount> storeCreditAccounts;

  /// The store credit account's estimate count.
  @JsonKey(name: 'estimate_count')
  final num? estimateCount;

  Map<String, Object?> toJson() =>
      _$AdminStoreCreditAccountsResponseToJson(this);
}
