// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'store_store_credit_account.dart';

part 'store_store_credit_account_response.g.dart';

/// The store credit account's details.
@JsonSerializable()
class StoreStoreCreditAccountResponse {
  const StoreStoreCreditAccountResponse({required this.storeCreditAccount});

  factory StoreStoreCreditAccountResponse.fromJson(Map<String, Object?> json) =>
      _$StoreStoreCreditAccountResponseFromJson(json);

  @JsonKey(name: 'store_credit_account')
  final StoreStoreCreditAccount storeCreditAccount;

  Map<String, Object?> toJson() =>
      _$StoreStoreCreditAccountResponseToJson(this);
}
