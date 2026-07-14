// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

part 'admin_plugin.g.dart';

/// The plugin's details.
@JsonSerializable()
class AdminPlugin {
  const AdminPlugin({required this.name});

  factory AdminPlugin.fromJson(Map<String, Object?> json) =>
      _$AdminPluginFromJson(json);

  /// The plugin's name.
  final String name;

  Map<String, Object?> toJson() => _$AdminPluginToJson(this);
}
