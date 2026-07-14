// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'admin_view_configuration.dart';

part 'admin_view_configuration_response.g.dart';

/// The details of a view configuration.
@JsonSerializable()
class AdminViewConfigurationResponse {
  const AdminViewConfigurationResponse({required this.viewConfiguration});

  factory AdminViewConfigurationResponse.fromJson(Map<String, Object?> json) =>
      _$AdminViewConfigurationResponseFromJson(json);

  @JsonKey(name: 'view_configuration')
  final AdminViewConfiguration viewConfiguration;

  Map<String, Object?> toJson() => _$AdminViewConfigurationResponseToJson(this);
}
