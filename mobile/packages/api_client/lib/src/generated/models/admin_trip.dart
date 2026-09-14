// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'admin_trip_status.dart';

part 'admin_trip.g.dart';

@JsonSerializable()
class AdminTrip {
  const AdminTrip({
    required this.id,
    required this.driverId,
    required this.locationId,
    required this.status,
    this.startedAt,
    this.finishedAt,
    this.note,
  });

  factory AdminTrip.fromJson(Map<String, Object?> json) =>
      _$AdminTripFromJson(json);

  final String id;
  @JsonKey(name: 'driver_id')
  final String driverId;
  @JsonKey(name: 'location_id')
  final String locationId;
  final AdminTripStatus status;
  @JsonKey(name: 'started_at')
  final DateTime? startedAt;
  @JsonKey(name: 'finished_at')
  final DateTime? finishedAt;
  final String? note;

  Map<String, Object?> toJson() => _$AdminTripToJson(this);
}
