// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'admin_currency.dart';

part 'admin_store_currency.g.dart';

/// The details of a store's currency.
@JsonSerializable()
class AdminStoreCurrency {
  const AdminStoreCurrency({
    required this.id,
    required this.currencyCode,
    required this.storeId,
    required this.isDefault,
    required this.currency,
    required this.createdAt,
    required this.updatedAt,
    required this.deletedAt,
  });

  factory AdminStoreCurrency.fromJson(Map<String, Object?> json) =>
      _$AdminStoreCurrencyFromJson(json);

  /// The currency's ID.
  final String id;

  /// The currency's code.
  @JsonKey(name: 'currency_code')
  final String currencyCode;

  /// The ID of the store this currency belongs to.
  @JsonKey(name: 'store_id')
  final String storeId;

  /// Whether this currency is the default in the store.
  @JsonKey(name: 'is_default')
  final bool isDefault;
  final AdminCurrency currency;

  /// The date the currency was created.
  @JsonKey(name: 'created_at')
  final DateTime createdAt;

  /// The date the currency was updated.
  @JsonKey(name: 'updated_at')
  final DateTime updatedAt;

  /// The date the currency was deleted.
  @JsonKey(name: 'deleted_at')
  final DateTime? deletedAt;

  Map<String, Object?> toJson() => _$AdminStoreCurrencyToJson(this);
}
