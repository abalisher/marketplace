// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'configuration4.dart';

part 'admin_update_view_configuration.g.dart';

/// The details to update in a view configuration.
@JsonSerializable()
class AdminUpdateViewConfiguration {
  const AdminUpdateViewConfiguration({
    this.setActive,
    this.name,
    this.isSystemDefault,
    this.configuration,
  });

  factory AdminUpdateViewConfiguration.fromJson(Map<String, Object?> json) =>
      _$AdminUpdateViewConfigurationFromJson(json);

  /// Whether the view is set as active.
  @JsonKey(name: 'set_active')
  final bool? setActive;

  /// The view's name.
  final String? name;

  /// Whether the view is the system default.
  @JsonKey(name: 'is_system_default')
  final bool? isSystemDefault;

  /// The view's configuration.
  final Configuration4? configuration;

  Map<String, Object?> toJson() => _$AdminUpdateViewConfigurationToJson(this);
}
