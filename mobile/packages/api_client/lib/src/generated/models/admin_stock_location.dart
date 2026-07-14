// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'admin_fulfillment_provider.dart';
import 'admin_sales_channel.dart';
import 'admin_stock_location_address.dart';

part 'admin_stock_location.g.dart';

/// The stock location's details.
@JsonSerializable()
class AdminStockLocation {
  const AdminStockLocation({
    required this.id,
    required this.name,
    required this.addressId,
    required this.metadata,
    this.address,
    this.salesChannels,
    this.fulfillmentProviders,
    this.fulfillmentSets,
  });

  factory AdminStockLocation.fromJson(Map<String, Object?> json) =>
      _$AdminStockLocationFromJson(json);

  /// The location's ID.
  final String id;

  /// The location's name.
  final String name;

  /// The ID of the associated address.
  @JsonKey(name: 'address_id')
  final String addressId;
  final AdminStockLocationAddress? address;

  /// The sales channels associated with the location.
  @JsonKey(name: 'sales_channels')
  final List<AdminSalesChannel>? salesChannels;

  /// The fulfillment providers associated with the location.
  @JsonKey(name: 'fulfillment_providers')
  final List<AdminFulfillmentProvider>? fulfillmentProviders;

  /// The fulfillment sets associated with the location.
  @JsonKey(name: 'fulfillment_sets')
  final List<dynamic>? fulfillmentSets;

  /// Key-value pairs of custom data.
  final dynamic metadata;

  Map<String, Object?> toJson() => _$AdminStockLocationToJson(this);
}
