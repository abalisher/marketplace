// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

part 'deleted3.g.dart';

@JsonSerializable()
class Deleted3 {
  const Deleted3({
    required this.id,
    required this.object,
    required this.deleted,
  });

  factory Deleted3.fromJson(Map<String, Object?> json) =>
      _$Deleted3FromJson(json);

  /// The ID of the deleted property label.
  final String id;

  /// The type of the deleted object.
  final String object;

  /// Indicates if the property label was deleted.
  final bool deleted;

  Map<String, Object?> toJson() => _$Deleted3ToJson(this);
}
