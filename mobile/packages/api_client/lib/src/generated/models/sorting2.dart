// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

part 'sorting2.g.dart';

@JsonSerializable()
class Sorting2 {
  const Sorting2({required this.id, required this.desc});

  factory Sorting2.fromJson(Map<String, Object?> json) =>
      _$Sorting2FromJson(json);

  /// The ID of the sorting column.
  final String id;

  /// Whether the sorting is descending.
  final bool desc;

  Map<String, Object?> toJson() => _$Sorting2ToJson(this);
}
