// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

part 'admin_record_gps_ping.g.dart';

@JsonSerializable()
class AdminRecordGpsPing {
  const AdminRecordGpsPing({
    required this.driverId,
    required this.lat,
    required this.lng,
  });

  factory AdminRecordGpsPing.fromJson(Map<String, Object?> json) =>
      _$AdminRecordGpsPingFromJson(json);

  @JsonKey(name: 'driver_id')
  final String driverId;
  final num lat;
  final num lng;

  Map<String, Object?> toJson() => _$AdminRecordGpsPingToJson(this);
}
