// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'admin_inventory_item.dart';

part 'admin_reservation.g.dart';

/// The reservation's details.
@JsonSerializable()
class AdminReservation {
  const AdminReservation({
    required this.id,
    required this.lineItemId,
    required this.locationId,
    required this.quantity,
    required this.externalId,
    required this.description,
    required this.inventoryItemId,
    this.inventoryItem,
    this.metadata,
    this.createdBy,
    this.deletedAt,
    this.createdAt,
    this.updatedAt,
  });

  factory AdminReservation.fromJson(Map<String, Object?> json) =>
      _$AdminReservationFromJson(json);

  /// The reservation's ID.
  final String id;

  /// The ID of the line item this reservation is for.
  @JsonKey(name: 'line_item_id')
  final String lineItemId;

  /// The ID of the location the quantity is reserved from.
  @JsonKey(name: 'location_id')
  final String locationId;

  /// The reservation's quantity.
  final num quantity;

  /// An ID in an external system
  @JsonKey(name: 'external_id')
  final String? externalId;

  /// The reservation's description.
  final String? description;

  /// The ID of the inventory item this reservation is associated with.
  @JsonKey(name: 'inventory_item_id')
  final String inventoryItemId;
  @JsonKey(name: 'inventory_item')
  final AdminInventoryItem? inventoryItem;

  /// The reservation's metadata, can hold custom key-value pairs.
  final dynamic metadata;

  /// The ID of the user that created this reservation.
  @JsonKey(name: 'created_by')
  final String? createdBy;

  /// The date this reservation was deleted.
  @JsonKey(name: 'deleted_at')
  final DateTime? deletedAt;

  /// The date this reservation was created.
  @JsonKey(name: 'created_at')
  final DateTime? createdAt;

  /// The date this reservation was updated.
  @JsonKey(name: 'updated_at')
  final DateTime? updatedAt;

  Map<String, Object?> toJson() => _$AdminReservationToJson(this);
}
