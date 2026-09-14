// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

part 'admin_gps_ping.g.dart';

@JsonSerializable()
class AdminGpsPing {
  const AdminGpsPing({
    required this.id,
    required this.tripId,
    required this.driverId,
    required this.lat,
    required this.lng,
    required this.recordedAt,
  });

  factory AdminGpsPing.fromJson(Map<String, Object?> json) =>
      _$AdminGpsPingFromJson(json);

  final String id;
  @JsonKey(name: 'trip_id')
  final String tripId;
  @JsonKey(name: 'driver_id')
  final String driverId;
  final num lat;
  final num lng;
  @JsonKey(name: 'recorded_at')
  final DateTime recordedAt;

  Map<String, Object?> toJson() => _$AdminGpsPingToJson(this);
}
