// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

part 'sorting3.g.dart';

@JsonSerializable()
class Sorting3 {
  const Sorting3({required this.id, required this.desc});

  factory Sorting3.fromJson(Map<String, Object?> json) =>
      _$Sorting3FromJson(json);

  /// The ID of the sorting column.
  final String id;

  /// Whether the sorting is descending.
  final bool desc;

  Map<String, Object?> toJson() => _$Sorting3ToJson(this);
}
