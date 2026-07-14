// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'admin_upsert_stock_location_address.dart';

part 'admin_update_stock_location.g.dart';

/// The properties to update in a stock location.
@JsonSerializable()
class AdminUpdateStockLocation {
  const AdminUpdateStockLocation({
    this.name,
    this.address,
    this.addressId,
    this.metadata,
  });

  factory AdminUpdateStockLocation.fromJson(Map<String, Object?> json) =>
      _$AdminUpdateStockLocationFromJson(json);

  /// The stock location's name.
  final String? name;
  final AdminUpsertStockLocationAddress? address;

  /// The ID of an existing stock location address to associate the stock location with.
  @JsonKey(name: 'address_id')
  final String? addressId;

  /// The stock location's metadata, can hold custom key-value pairs.
  final dynamic metadata;

  Map<String, Object?> toJson() => _$AdminUpdateStockLocationToJson(this);
}
