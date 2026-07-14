// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

part 'admin_credit_store_credit_account_params.g.dart';

/// The details of crediting a store credit account.
@JsonSerializable()
class AdminCreditStoreCreditAccountParams {
  const AdminCreditStoreCreditAccountParams({required this.amount, this.note});

  factory AdminCreditStoreCreditAccountParams.fromJson(
    Map<String, Object?> json,
  ) => _$AdminCreditStoreCreditAccountParamsFromJson(json);

  /// The amount to credit the store credit account with.
  final num amount;

  /// An additional note to add to the store credit transaction.
  final String? note;

  Map<String, Object?> toJson() =>
      _$AdminCreditStoreCreditAccountParamsToJson(this);
}
