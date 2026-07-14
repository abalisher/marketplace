// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'configuration5.dart';

part 'admin_view_configuration.g.dart';

/// The details of a view configuration.
@JsonSerializable()
class AdminViewConfiguration {
  const AdminViewConfiguration({
    required this.id,
    required this.entity,
    required this.name,
    required this.userId,
    required this.isSystemDefault,
    required this.createdAt,
    required this.updatedAt,
    this.configuration,
  });

  factory AdminViewConfiguration.fromJson(Map<String, Object?> json) =>
      _$AdminViewConfigurationFromJson(json);

  /// The view configuration's ID.
  final String id;

  /// The entity the view configuration belongs to.
  final String entity;

  /// The view configuration's name.
  final String name;

  /// The ID of the user the view configuration belongs to. If `null`, the view configuration is a system default.
  @JsonKey(name: 'user_id')
  final String userId;

  /// Whether the view configuration is the system default.
  @JsonKey(name: 'is_system_default')
  final bool isSystemDefault;

  /// The view's configuration.
  final Configuration5? configuration;

  /// The date the view configuration was created.
  @JsonKey(name: 'created_at')
  final DateTime createdAt;

  /// The date the view configuration was updated.
  @JsonKey(name: 'updated_at')
  final DateTime updatedAt;

  Map<String, Object?> toJson() => _$AdminViewConfigurationToJson(this);
}
