// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'admin_trip.dart';
import 'admin_trip_stop.dart';

part 'admin_trip_detail_res.g.dart';

@JsonSerializable()
class AdminTripDetailRes {
  const AdminTripDetailRes({required this.trip, required this.stops});

  factory AdminTripDetailRes.fromJson(Map<String, Object?> json) =>
      _$AdminTripDetailResFromJson(json);

  final AdminTrip trip;
  final List<AdminTripStop> stops;

  Map<String, Object?> toJson() => _$AdminTripDetailResToJson(this);
}
