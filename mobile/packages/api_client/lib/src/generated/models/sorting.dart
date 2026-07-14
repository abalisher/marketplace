// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

part 'sorting.g.dart';

@JsonSerializable()
class Sorting {
  const Sorting({required this.id, required this.desc});

  factory Sorting.fromJson(Map<String, Object?> json) =>
      _$SortingFromJson(json);

  /// The ID of the sorting column.
  final String id;

  /// Whether the sorting is descending.
  final bool desc;

  Map<String, Object?> toJson() => _$SortingToJson(this);
}
