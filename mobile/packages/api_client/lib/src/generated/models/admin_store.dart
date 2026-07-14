// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'admin_store_currency.dart';
import 'admin_store_locale.dart';

part 'admin_store.g.dart';

/// The store's details.
@JsonSerializable()
class AdminStore {
  const AdminStore({
    required this.id,
    required this.name,
    required this.supportedCurrencies,
    required this.defaultSalesChannelId,
    required this.defaultRegionId,
    required this.defaultLocationId,
    required this.metadata,
    required this.createdAt,
    required this.updatedAt,
    required this.supportedLocales,
  });

  factory AdminStore.fromJson(Map<String, Object?> json) =>
      _$AdminStoreFromJson(json);

  /// The store's ID.
  final String id;

  /// The store's name.
  final String name;

  /// The store's supported currencies.
  @JsonKey(name: 'supported_currencies')
  final List<AdminStoreCurrency> supportedCurrencies;

  /// The ID of the sales channel used by default in the store.
  @JsonKey(name: 'default_sales_channel_id')
  final String defaultSalesChannelId;

  /// The ID of the region used by default in the store.
  @JsonKey(name: 'default_region_id')
  final String defaultRegionId;

  /// The ID of the stock location used by default in the store.
  @JsonKey(name: 'default_location_id')
  final String defaultLocationId;

  /// The store's metadata, can hold custom key-value pairs.
  final dynamic metadata;

  /// The date the store was created.
  @JsonKey(name: 'created_at')
  final DateTime createdAt;

  /// The date the store was updated.
  @JsonKey(name: 'updated_at')
  final DateTime updatedAt;

  /// The store's supported locales.
  @JsonKey(name: 'supported_locales')
  final List<AdminStoreLocale> supportedLocales;

  Map<String, Object?> toJson() => _$AdminStoreToJson(this);
}
