// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

part 'deleted4.g.dart';

@JsonSerializable()
class Deleted4 {
  const Deleted4({
    required this.ids,
    required this.object,
    required this.deleted,
  });

  factory Deleted4.fromJson(Map<String, Object?> json) =>
      _$Deleted4FromJson(json);

  /// The IDs of the deleted translation settings.
  final List<String> ids;

  /// The type of object deleted.
  final String object;

  /// Whether the deletion was successful.
  final bool deleted;

  Map<String, Object?> toJson() => _$Deleted4ToJson(this);
}
