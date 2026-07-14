// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'configuration2.dart';

part 'admin_layout_configuration.g.dart';

/// The layout configuration's details.
@JsonSerializable()
class AdminLayoutConfiguration {
  const AdminLayoutConfiguration({
    required this.id,
    required this.zone,
    required this.userId,
    required this.isSystemDefault,
    required this.configuration,
    required this.createdAt,
    required this.updatedAt,
  });

  factory AdminLayoutConfiguration.fromJson(Map<String, Object?> json) =>
      _$AdminLayoutConfigurationFromJson(json);

  /// The layout configuration's ID.
  final String id;

  /// The layout configuration's zone.
  final String zone;

  /// The ID of the user who created the layout configuration.
  @JsonKey(name: 'user_id')
  final String userId;

  /// Whether the layout configuration is a system default.
  @JsonKey(name: 'is_system_default')
  final bool isSystemDefault;

  /// The configuration's details.
  final Configuration2 configuration;

  /// The date the layout configuration was created.
  @JsonKey(name: 'created_at')
  final DateTime createdAt;

  /// The date the layout configuration was last updated.
  @JsonKey(name: 'updated_at')
  final DateTime updatedAt;

  Map<String, Object?> toJson() => _$AdminLayoutConfigurationToJson(this);
}
