// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'admin_gps_ping.dart';

part 'admin_gps_ping_res.g.dart';

@JsonSerializable()
class AdminGpsPingRes {
  const AdminGpsPingRes({required this.ping});

  factory AdminGpsPingRes.fromJson(Map<String, Object?> json) =>
      _$AdminGpsPingResFromJson(json);

  final AdminGpsPing ping;

  Map<String, Object?> toJson() => _$AdminGpsPingResToJson(this);
}
