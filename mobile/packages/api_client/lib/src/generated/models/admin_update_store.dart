// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'admin_update_store_supported_currency.dart';
import 'admin_update_store_supported_locale.dart';

part 'admin_update_store.g.dart';

/// The properties to update in a store.
@JsonSerializable()
class AdminUpdateStore {
  const AdminUpdateStore({
    this.name,
    this.supportedCurrencies,
    this.defaultSalesChannelId,
    this.defaultRegionId,
    this.defaultLocationId,
    this.metadata,
    this.supportedLocales,
  });

  factory AdminUpdateStore.fromJson(Map<String, Object?> json) =>
      _$AdminUpdateStoreFromJson(json);

  /// The store's name.
  final String? name;

  /// The store's supported currencies.
  @JsonKey(name: 'supported_currencies')
  final List<AdminUpdateStoreSupportedCurrency>? supportedCurrencies;

  /// The ID of the default sales channel in the store.
  @JsonKey(name: 'default_sales_channel_id')
  final String? defaultSalesChannelId;

  /// The ID of the default region in the store.
  @JsonKey(name: 'default_region_id')
  final String? defaultRegionId;

  /// The ID of the default stock location in the store.
  @JsonKey(name: 'default_location_id')
  final String? defaultLocationId;

  /// The store's metadata, can hold custom key-value pairs.
  final dynamic metadata;

  /// The store's supported locales.
  @JsonKey(name: 'supported_locales')
  final List<AdminUpdateStoreSupportedLocale>? supportedLocales;

  Map<String, Object?> toJson() => _$AdminUpdateStoreToJson(this);
}
