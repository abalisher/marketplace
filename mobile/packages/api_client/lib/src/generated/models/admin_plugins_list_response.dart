// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'admin_plugin.dart';

part 'admin_plugins_list_response.g.dart';

/// The list of plugins.
@JsonSerializable()
class AdminPluginsListResponse {
  const AdminPluginsListResponse({required this.plugins});

  factory AdminPluginsListResponse.fromJson(Map<String, Object?> json) =>
      _$AdminPluginsListResponseFromJson(json);

  /// The list of plugins.
  final List<AdminPlugin> plugins;

  Map<String, Object?> toJson() => _$AdminPluginsListResponseToJson(this);
}
