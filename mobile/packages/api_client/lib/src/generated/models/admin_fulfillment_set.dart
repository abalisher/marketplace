// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'admin_service_zone.dart';
import 'admin_stock_location.dart';

part 'admin_fulfillment_set.g.dart';

/// The service zone's fulfillment set.
@JsonSerializable()
class AdminFulfillmentSet {
  const AdminFulfillmentSet({
    required this.id,
    required this.name,
    required this.type,
    required this.location,
    required this.serviceZones,
    required this.createdAt,
    required this.updatedAt,
    required this.deletedAt,
  });

  factory AdminFulfillmentSet.fromJson(Map<String, Object?> json) =>
      _$AdminFulfillmentSetFromJson(json);

  /// The fulfillment set's ID.
  final String id;

  /// The fulfillment set's name.
  final String name;

  /// The fulfillment set's type.
  final String type;
  final AdminStockLocation location;

  /// The fulfillment set's service zones.
  @JsonKey(name: 'service_zones')
  final List<AdminServiceZone> serviceZones;

  /// The fulfillment set's created at.
  @JsonKey(name: 'created_at')
  final DateTime createdAt;

  /// The fulfillment set's updated at.
  @JsonKey(name: 'updated_at')
  final DateTime updatedAt;

  /// The fulfillment set's deleted at.
  @JsonKey(name: 'deleted_at')
  final DateTime deletedAt;

  Map<String, Object?> toJson() => _$AdminFulfillmentSetToJson(this);
}
