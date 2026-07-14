// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

part 'relationship.g.dart';

@JsonSerializable()
class Relationship {
  const Relationship({required this.entity, required this.field});

  factory Relationship.fromJson(Map<String, Object?> json) =>
      _$RelationshipFromJson(json);

  /// The related entity.
  final String entity;

  /// The field in the related entity.
  final String field;

  Map<String, Object?> toJson() => _$RelationshipToJson(this);
}
