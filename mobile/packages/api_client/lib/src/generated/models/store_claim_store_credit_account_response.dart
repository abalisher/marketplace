// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'store_store_credit_account.dart';

part 'store_claim_store_credit_account_response.g.dart';

/// The details of the claimed store credit account.
@JsonSerializable()
class StoreClaimStoreCreditAccountResponse {
  const StoreClaimStoreCreditAccountResponse({
    required this.storeCreditAccount,
  });

  factory StoreClaimStoreCreditAccountResponse.fromJson(
    Map<String, Object?> json,
  ) => _$StoreClaimStoreCreditAccountResponseFromJson(json);

  @JsonKey(name: 'store_credit_account')
  final StoreStoreCreditAccount storeCreditAccount;

  Map<String, Object?> toJson() =>
      _$StoreClaimStoreCreditAccountResponseToJson(this);
}
