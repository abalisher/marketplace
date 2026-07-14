// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'sorting.dart';

part 'configuration.g.dart';

@JsonSerializable()
class Configuration {
  const Configuration({
    required this.visibleColumns,
    required this.columnOrder,
    this.search,
    this.columnWidths,
    this.filters,
    this.sorting,
  });

  factory Configuration.fromJson(Map<String, Object?> json) =>
      _$ConfigurationFromJson(json);

  /// The configuration's visible columns.
  @JsonKey(name: 'visible_columns')
  final List<String> visibleColumns;

  /// The columns in the order they should be displayed.
  @JsonKey(name: 'column_order')
  final List<String> columnOrder;

  /// The search query used in the view.
  final String? search;

  /// The column widths in the view.
  @JsonKey(name: 'column_widths')
  final dynamic columnWidths;

  /// The filters applied to the view.
  final dynamic filters;

  /// The sorting applied to the view.
  final Sorting? sorting;

  Map<String, Object?> toJson() => _$ConfigurationToJson(this);
}
