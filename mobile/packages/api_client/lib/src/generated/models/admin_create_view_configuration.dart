// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'configuration.dart';

part 'admin_create_view_configuration.g.dart';

/// The details of a view configuration to create.
@JsonSerializable()
class AdminCreateViewConfiguration {
  const AdminCreateViewConfiguration({
    this.isSystemDefault,
    this.setActive,
    this.configuration,
    this.name,
  });

  factory AdminCreateViewConfiguration.fromJson(Map<String, Object?> json) =>
      _$AdminCreateViewConfigurationFromJson(json);

  /// Whether the view is the system default. If so, it will be used as the default view for all users that don't have a custom active view set.
  @JsonKey(name: 'is_system_default')
  final bool? isSystemDefault;

  /// Whether the view is set as active.
  @JsonKey(name: 'set_active')
  final bool? setActive;

  /// The view's configuration.
  final Configuration? configuration;

  /// The view's name.
  final String? name;

  Map<String, Object?> toJson() => _$AdminCreateViewConfigurationToJson(this);
}
