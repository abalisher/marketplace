// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

part 'relationship_filter_config.g.dart';

/// The filter's relationship details. Only available if the filter is a relationship filter.
@JsonSerializable()
class RelationshipFilterConfig {
  const RelationshipFilterConfig({
    required this.entity,
    required this.valueField,
    required this.displayField,
    required this.multiple,
    required this.endpoint,
  });

  factory RelationshipFilterConfig.fromJson(Map<String, Object?> json) =>
      _$RelationshipFilterConfigFromJson(json);

  /// The entity the relationship filter is for.
  final String entity;

  /// The relationship filter's value field.
  @JsonKey(name: 'value_field')
  final String valueField;

  /// The relationship filter's display field.
  @JsonKey(name: 'display_field')
  final String displayField;

  /// Whether the relationship filter allows multiple selections.
  final bool multiple;

  /// The relationship filter's endpoint.
  final String endpoint;

  Map<String, Object?> toJson() => _$RelationshipFilterConfigToJson(this);
}
