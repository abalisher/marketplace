// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

part 'admin_create_trip.g.dart';

@JsonSerializable()
class AdminCreateTrip {
  const AdminCreateTrip({
    required this.driverId,
    required this.locationId,
    this.note,
  });

  factory AdminCreateTrip.fromJson(Map<String, Object?> json) =>
      _$AdminCreateTripFromJson(json);

  @JsonKey(name: 'driver_id')
  final String driverId;
  @JsonKey(name: 'location_id')
  final String locationId;
  final String? note;

  Map<String, Object?> toJson() => _$AdminCreateTripToJson(this);
}
