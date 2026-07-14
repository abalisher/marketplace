// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

part 'tags.g.dart';

@JsonSerializable()
class Tags {
  const Tags({required this.id});

  factory Tags.fromJson(Map<String, Object?> json) => _$TagsFromJson(json);

  /// The tag's ID.
  final String id;

  Map<String, Object?> toJson() => _$TagsToJson(this);
}
