// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

part 'store_claim_store_credit_account_params.g.dart';

/// The parameters required to claim a store credit account.
@JsonSerializable()
class StoreClaimStoreCreditAccountParams {
  const StoreClaimStoreCreditAccountParams({required this.code});

  factory StoreClaimStoreCreditAccountParams.fromJson(
    Map<String, Object?> json,
  ) => _$StoreClaimStoreCreditAccountParamsFromJson(json);

  /// The store credit account's code.
  final String code;

  Map<String, Object?> toJson() =>
      _$StoreClaimStoreCreditAccountParamsToJson(this);
}
