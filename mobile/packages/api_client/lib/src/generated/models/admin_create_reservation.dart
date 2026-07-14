// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

part 'admin_create_reservation.g.dart';

/// The reservation's details.
@JsonSerializable()
class AdminCreateReservation {
  const AdminCreateReservation({
    required this.locationId,
    required this.inventoryItemId,
    required this.quantity,
    this.lineItemId,
    this.description,
    this.metadata,
  });

  factory AdminCreateReservation.fromJson(Map<String, Object?> json) =>
      _$AdminCreateReservationFromJson(json);

  /// The ID of the line item this reservation is created for.
  @JsonKey(name: 'line_item_id')
  final String? lineItemId;

  /// The ID of the location the quantity is reserved from.
  @JsonKey(name: 'location_id')
  final String locationId;

  /// The ID of the inventory item associated with the line item's variant.
  @JsonKey(name: 'inventory_item_id')
  final String inventoryItemId;

  /// The reserved quantity.
  final num quantity;

  /// The reservation's description.
  final String? description;

  /// The reservation's metadata, used to store custom key-value pairs.
  final dynamic metadata;

  Map<String, Object?> toJson() => _$AdminCreateReservationToJson(this);
}
