// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'admin_column_category.dart';
import 'admin_column_data_type.dart';
import 'computed.dart';
import 'filter.dart';
import 'relationship.dart';
import 'source.dart';

part 'admin_column.g.dart';

/// The details of a column in a view configuration.
@JsonSerializable()
class AdminColumn {
  const AdminColumn({
    required this.id,
    required this.name,
    required this.field,
    required this.sortable,
    required this.hideable,
    required this.defaultVisible,
    required this.dataType,
    this.description,
    this.semanticType,
    this.context,
    this.computed,
    this.relationship,
    this.defaultOrder,
    this.category,
    this.renderMode,
    this.filter,
    this.source,
    this.customLabel,
    this.labelId,
    this.metadata,
  });

  factory AdminColumn.fromJson(Map<String, Object?> json) =>
      _$AdminColumnFromJson(json);

  /// The column's ID.
  final String id;

  /// The column's name. This is displayed in the view header.
  final String name;

  /// The column's description.
  final String? description;

  /// The column's field in the entity.
  final String field;

  /// Whether the column is sortable.
  final bool sortable;

  /// Whether the column is hideable.
  final bool hideable;

  /// Whether the column is visible by default.
  @JsonKey(name: 'default_visible')
  final bool defaultVisible;

  /// The data type of the column's value.
  @JsonKey(name: 'data_type')
  final AdminColumnDataType dataType;

  /// The column's semantic type. It can be `computed`, or other primitive types.
  @JsonKey(name: 'semantic_type')
  final String? semanticType;

  /// The column's context. It can be `display` or `generic`.
  final String? context;

  /// A computed column's details. Only available if the column's `semantic_type` is `computed`.
  final Computed? computed;

  /// The relationship details. Only available for relationship columns.
  final Relationship? relationship;

  /// The column's sort order in the default view configuration.
  @JsonKey(name: 'default_order')
  final num? defaultOrder;

  /// The column's category.
  final AdminColumnCategory? category;

  /// The column's render mode.
  @JsonKey(name: 'render_mode')
  final String? renderMode;

  /// The column's filter.
  final Filter? filter;

  /// The column's source details. Only available if the column is from a source.
  final Source? source;

  /// Whether the column has a custom label.
  @JsonKey(name: 'custom_label')
  final bool? customLabel;

  /// The ID of the column's label, if it has a custom label.
  @JsonKey(name: 'label_id')
  final String? labelId;

  /// The column's metadata.
  final dynamic metadata;

  Map<String, Object?> toJson() => _$AdminColumnToJson(this);
}
