// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

part 'tags2.g.dart';

@JsonSerializable()
class Tags2 {
  const Tags2({required this.id});

  factory Tags2.fromJson(Map<String, Object?> json) => _$Tags2FromJson(json);

  /// The tag's ID.
  final String id;

  Map<String, Object?> toJson() => _$Tags2ToJson(this);
}
