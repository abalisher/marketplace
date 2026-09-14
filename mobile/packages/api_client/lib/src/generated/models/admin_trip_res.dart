// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'admin_trip.dart';

part 'admin_trip_res.g.dart';

@JsonSerializable()
class AdminTripRes {
  const AdminTripRes({required this.trip});

  factory AdminTripRes.fromJson(Map<String, Object?> json) =>
      _$AdminTripResFromJson(json);

  final AdminTrip trip;

  Map<String, Object?> toJson() => _$AdminTripResToJson(this);
}
