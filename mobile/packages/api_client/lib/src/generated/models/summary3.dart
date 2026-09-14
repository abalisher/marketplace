// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

part 'summary3.g.dart';

@JsonSerializable()
class Summary3 {
  const Summary3({
    required this.rows,
    required this.changes,
    required this.unchanged,
    required this.issues,
  });

  factory Summary3.fromJson(Map<String, Object?> json) =>
      _$Summary3FromJson(json);

  final int rows;
  final int changes;
  final int unchanged;
  final int issues;

  Map<String, Object?> toJson() => _$Summary3ToJson(this);
}
