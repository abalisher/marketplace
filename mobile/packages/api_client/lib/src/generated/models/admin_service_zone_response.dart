// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'admin_service_zone.dart';

part 'admin_service_zone_response.g.dart';

/// The service zone's details.
@JsonSerializable()
class AdminServiceZoneResponse {
  const AdminServiceZoneResponse({required this.serviceZone});

  factory AdminServiceZoneResponse.fromJson(Map<String, Object?> json) =>
      _$AdminServiceZoneResponseFromJson(json);

  @JsonKey(name: 'service_zone')
  final AdminServiceZone serviceZone;

  Map<String, Object?> toJson() => _$AdminServiceZoneResponseToJson(this);
}
