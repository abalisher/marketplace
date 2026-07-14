// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'admin_column.dart';

part 'admin_views_entity_columns_response.g.dart';

/// The view's columns.
@JsonSerializable()
class AdminViewsEntityColumnsResponse {
  const AdminViewsEntityColumnsResponse({required this.columns});

  factory AdminViewsEntityColumnsResponse.fromJson(Map<String, Object?> json) =>
      _$AdminViewsEntityColumnsResponseFromJson(json);

  /// The view's columns.
  final List<AdminColumn> columns;

  Map<String, Object?> toJson() =>
      _$AdminViewsEntityColumnsResponseToJson(this);
}
