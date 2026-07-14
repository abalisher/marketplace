// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

part 'tags3.g.dart';

@JsonSerializable()
class Tags3 {
  const Tags3({required this.id});

  factory Tags3.fromJson(Map<String, Object?> json) => _$Tags3FromJson(json);

  /// The tag's ID.
  final String id;

  Map<String, Object?> toJson() => _$Tags3ToJson(this);
}
