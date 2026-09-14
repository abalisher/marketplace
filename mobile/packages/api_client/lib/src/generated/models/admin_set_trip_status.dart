// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'admin_set_trip_status_status.dart';

part 'admin_set_trip_status.g.dart';

@JsonSerializable()
class AdminSetTripStatus {
  const AdminSetTripStatus({required this.status});

  factory AdminSetTripStatus.fromJson(Map<String, Object?> json) =>
      _$AdminSetTripStatusFromJson(json);

  final AdminSetTripStatusStatus status;

  Map<String, Object?> toJson() => _$AdminSetTripStatusToJson(this);
}
