// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'admin_upsert_stock_location_address.dart';

part 'admin_create_stock_location.g.dart';

/// The stock location's details.
@JsonSerializable()
class AdminCreateStockLocation {
  const AdminCreateStockLocation({
    required this.name,
    this.addressId,
    this.address,
    this.metadata,
  });

  factory AdminCreateStockLocation.fromJson(Map<String, Object?> json) =>
      _$AdminCreateStockLocationFromJson(json);

  /// The stock location's name.
  final String name;

  /// The ID of the stock location's address.
  @JsonKey(name: 'address_id')
  final String? addressId;
  final AdminUpsertStockLocationAddress? address;

  /// The stock location's metadata, used to store custom key-value pairs.
  final dynamic metadata;

  Map<String, Object?> toJson() => _$AdminCreateStockLocationToJson(this);
}
