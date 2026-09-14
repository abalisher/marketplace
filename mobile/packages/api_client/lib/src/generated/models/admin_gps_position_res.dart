// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'admin_gps_ping.dart';

part 'admin_gps_position_res.g.dart';

@JsonSerializable()
class AdminGpsPositionRes {
  const AdminGpsPositionRes({required this.position});

  factory AdminGpsPositionRes.fromJson(Map<String, Object?> json) =>
      _$AdminGpsPositionResFromJson(json);

  final AdminGpsPing? position;

  Map<String, Object?> toJson() => _$AdminGpsPositionResToJson(this);
}
