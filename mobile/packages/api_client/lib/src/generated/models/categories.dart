// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

part 'categories.g.dart';

@JsonSerializable()
class Categories {
  const Categories({required this.id});

  factory Categories.fromJson(Map<String, Object?> json) =>
      _$CategoriesFromJson(json);

  /// The category's ID.
  final String id;

  Map<String, Object?> toJson() => _$CategoriesToJson(this);
}
