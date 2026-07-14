// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'admin_region.dart';

part 'admin_region_response.g.dart';

/// The region's details.
@JsonSerializable()
class AdminRegionResponse {
  const AdminRegionResponse({required this.region});

  factory AdminRegionResponse.fromJson(Map<String, Object?> json) =>
      _$AdminRegionResponseFromJson(json);

  final AdminRegion region;

  Map<String, Object?> toJson() => _$AdminRegionResponseToJson(this);
}
