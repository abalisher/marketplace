// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'configuration3.dart';

part 'admin_set_layout_configuration.g.dart';

/// The details of setting the layout configuration for a zone in the admin dashboard.
@JsonSerializable()
class AdminSetLayoutConfiguration {
  const AdminSetLayoutConfiguration({
    required this.configuration,
    this.isDefault,
  });

  factory AdminSetLayoutConfiguration.fromJson(Map<String, Object?> json) =>
      _$AdminSetLayoutConfigurationFromJson(json);

  /// Whether the layout configuration is set as the default for the zone.
  @JsonKey(name: 'is_default')
  final bool? isDefault;

  /// The layout's configuration.
  final Configuration3 configuration;

  Map<String, Object?> toJson() => _$AdminSetLayoutConfigurationToJson(this);
}
