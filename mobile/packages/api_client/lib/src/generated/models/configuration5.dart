// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'sorting3.dart';

part 'configuration5.g.dart';

@JsonSerializable()
class Configuration5 {
  const Configuration5({
    required this.visibleColumns,
    required this.columnOrder,
    this.columnWidths,
    this.filters,
    this.sorting,
    this.search,
  });

  factory Configuration5.fromJson(Map<String, Object?> json) =>
      _$Configuration5FromJson(json);

  /// The configuration's visible columns.
  @JsonKey(name: 'visible_columns')
  final List<String> visibleColumns;

  /// The columns in the order they should be displayed.
  @JsonKey(name: 'column_order')
  final List<String> columnOrder;

  /// The column widths in the view.
  @JsonKey(name: 'column_widths')
  final dynamic columnWidths;

  /// The filters applied to the view.
  final dynamic filters;

  /// The sorting applied to the view.
  final Sorting3? sorting;

  /// The configuration's search.
  final String? search;

  Map<String, Object?> toJson() => _$Configuration5ToJson(this);
}
