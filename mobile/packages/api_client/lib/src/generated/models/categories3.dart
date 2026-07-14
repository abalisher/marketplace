// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

part 'categories3.g.dart';

@JsonSerializable()
class Categories3 {
  const Categories3({required this.id});

  factory Categories3.fromJson(Map<String, Object?> json) =>
      _$Categories3FromJson(json);

  /// The category's ID.
  final String id;

  Map<String, Object?> toJson() => _$Categories3ToJson(this);
}
