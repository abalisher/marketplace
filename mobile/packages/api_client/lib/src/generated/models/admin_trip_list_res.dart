// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'admin_trip.dart';

part 'admin_trip_list_res.g.dart';

@JsonSerializable()
class AdminTripListRes {
  const AdminTripListRes({required this.trips});

  factory AdminTripListRes.fromJson(Map<String, Object?> json) =>
      _$AdminTripListResFromJson(json);

  final List<AdminTrip> trips;

  Map<String, Object?> toJson() => _$AdminTripListResToJson(this);
}
