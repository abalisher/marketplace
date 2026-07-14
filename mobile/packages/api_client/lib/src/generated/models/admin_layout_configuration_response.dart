// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'admin_layout_configuration.dart';
import 'admin_layout_configuration_response_active_scope.dart';

part 'admin_layout_configuration_response.g.dart';

/// The details for a layout configuration response.
@JsonSerializable()
class AdminLayoutConfigurationResponse {
  const AdminLayoutConfigurationResponse({
    required this.personalConfiguration,
    required this.defaultConfiguration,
    required this.activeScope,
  });

  factory AdminLayoutConfigurationResponse.fromJson(
    Map<String, Object?> json,
  ) => _$AdminLayoutConfigurationResponseFromJson(json);

  @JsonKey(name: 'personal_configuration')
  final AdminLayoutConfiguration personalConfiguration;
  @JsonKey(name: 'default_configuration')
  final AdminLayoutConfiguration defaultConfiguration;

  /// The active scope of the layout configuration.
  @JsonKey(name: 'active_scope')
  final AdminLayoutConfigurationResponseActiveScope activeScope;

  Map<String, Object?> toJson() =>
      _$AdminLayoutConfigurationResponseToJson(this);
}
