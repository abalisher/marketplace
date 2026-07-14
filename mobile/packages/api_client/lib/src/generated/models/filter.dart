// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'relationship_filter_config.dart';

part 'filter.g.dart';

@JsonSerializable()
class Filter {
  const Filter({
    required this.enabled,
    this.operators,
    this.enumValues,
    this.relationship,
  });

  factory Filter.fromJson(Map<String, Object?> json) => _$FilterFromJson(json);

  /// Whether the column's filter is enabled.
  final bool enabled;

  /// The filter's operators.
  final List<String>? operators;

  /// The filter's enum values, if the filter supports enums.
  final List<String>? enumValues;
  final RelationshipFilterConfig? relationship;

  Map<String, Object?> toJson() => _$FilterToJson(this);
}
