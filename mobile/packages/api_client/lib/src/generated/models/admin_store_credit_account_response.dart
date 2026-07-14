// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'admin_store_credit_account.dart';

part 'admin_store_credit_account_response.g.dart';

/// The store credit account's details.
@JsonSerializable()
class AdminStoreCreditAccountResponse {
  const AdminStoreCreditAccountResponse({required this.storeCreditAccount});

  factory AdminStoreCreditAccountResponse.fromJson(Map<String, Object?> json) =>
      _$AdminStoreCreditAccountResponseFromJson(json);

  @JsonKey(name: 'store_credit_account')
  final AdminStoreCreditAccount storeCreditAccount;

  Map<String, Object?> toJson() =>
      _$AdminStoreCreditAccountResponseToJson(this);
}
