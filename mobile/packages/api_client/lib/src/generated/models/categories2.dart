// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

part 'categories2.g.dart';

@JsonSerializable()
class Categories2 {
  const Categories2({required this.id});

  factory Categories2.fromJson(Map<String, Object?> json) =>
      _$Categories2FromJson(json);

  /// The category's ID.
  final String id;

  Map<String, Object?> toJson() => _$Categories2ToJson(this);
}
