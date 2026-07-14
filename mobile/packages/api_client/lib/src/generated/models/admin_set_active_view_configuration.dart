// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

part 'admin_set_active_view_configuration.g.dart';

/// The details of a view configuration to set as active for the given entity.
@JsonSerializable()
class AdminSetActiveViewConfiguration {
  const AdminSetActiveViewConfiguration({required this.viewConfigurationId});

  factory AdminSetActiveViewConfiguration.fromJson(Map<String, Object?> json) =>
      _$AdminSetActiveViewConfigurationFromJson(json);

  /// The ID of the view configuration to set as active. If `null`, the active view configuration will be cleared, and the `code` or system default view configuration will be used as the active view.
  @JsonKey(name: 'view_configuration_id')
  final String viewConfigurationId;

  Map<String, Object?> toJson() =>
      _$AdminSetActiveViewConfigurationToJson(this);
}
