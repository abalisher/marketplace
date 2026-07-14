// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

part 'admin_update_reservation.g.dart';

/// The properties to update in the reservation.
@JsonSerializable()
class AdminUpdateReservation {
  const AdminUpdateReservation({
    this.locationId,
    this.quantity,
    this.description,
    this.metadata,
  });

  factory AdminUpdateReservation.fromJson(Map<String, Object?> json) =>
      _$AdminUpdateReservationFromJson(json);

  /// The ID of the associated location.
  @JsonKey(name: 'location_id')
  final String? locationId;

  /// The reserved quantity.
  final num? quantity;

  /// The reservation's description.
  final String? description;

  /// The reservation's metadata. Can hold custom key-value pairs.
  final dynamic metadata;

  Map<String, Object?> toJson() => _$AdminUpdateReservationToJson(this);
}
