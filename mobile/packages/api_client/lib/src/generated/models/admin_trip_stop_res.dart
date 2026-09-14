// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'admin_trip_stop.dart';

part 'admin_trip_stop_res.g.dart';

@JsonSerializable()
class AdminTripStopRes {
  const AdminTripStopRes({required this.stop});

  factory AdminTripStopRes.fromJson(Map<String, Object?> json) =>
      _$AdminTripStopResFromJson(json);

  final AdminTripStop stop;

  Map<String, Object?> toJson() => _$AdminTripStopResToJson(this);
}
