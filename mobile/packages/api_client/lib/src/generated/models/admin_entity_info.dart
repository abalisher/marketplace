// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

part 'admin_entity_info.g.dart';

/// The details of an entity.
@JsonSerializable()
class AdminEntityInfo {
  const AdminEntityInfo({
    required this.name,
    required this.pluralName,
    required this.module,
    required this.propertyCount,
    required this.hasOverrides,
  });

  factory AdminEntityInfo.fromJson(Map<String, Object?> json) =>
      _$AdminEntityInfoFromJson(json);

  /// The entity's name.
  final String name;

  /// The entity's plural name.
  final String pluralName;

  /// The module the entity belongs to.
  final String module;

  /// The number of properties the entity has.
  final num propertyCount;

  /// Whether the entity has overrides.
  final bool hasOverrides;

  Map<String, Object?> toJson() => _$AdminEntityInfoToJson(this);
}
