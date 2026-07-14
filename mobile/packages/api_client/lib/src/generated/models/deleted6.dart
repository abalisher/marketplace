// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

part 'deleted6.g.dart';

@JsonSerializable()
class Deleted6 {
  const Deleted6({
    required this.ids,
    required this.deleted,
    this.object = 'translation',
  });

  factory Deleted6.fromJson(Map<String, Object?> json) =>
      _$Deleted6FromJson(json);

  /// The IDs of the deleted translations.
  final List<String> ids;

  /// The type of object deleted.
  final String object;

  /// Whether the translations were successfully deleted.
  final bool deleted;

  Map<String, Object?> toJson() => _$Deleted6ToJson(this);
}
