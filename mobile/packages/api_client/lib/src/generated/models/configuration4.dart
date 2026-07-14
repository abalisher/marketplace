// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'sorting2.dart';

part 'configuration4.g.dart';

@JsonSerializable()
class Configuration4 {
  const Configuration4({
    this.search,
    this.visibleColumns,
    this.columnOrder,
    this.columnWidths,
    this.filters,
    this.sorting,
  });

  factory Configuration4.fromJson(Map<String, Object?> json) =>
      _$Configuration4FromJson(json);

  /// The search query used in the view.
  final String? search;

  /// The configuration's visible columns.
  @JsonKey(name: 'visible_columns')
  final List<String>? visibleColumns;

  /// The columns in the order they should be displayed.
  @JsonKey(name: 'column_order')
  final List<String>? columnOrder;

  /// The column widths in the view.
  @JsonKey(name: 'column_widths')
  final dynamic columnWidths;

  /// The filters applied to the view.
  final dynamic filters;

  /// The sorting applied to the view.
  final Sorting2? sorting;

  Map<String, Object?> toJson() => _$Configuration4ToJson(this);
}
