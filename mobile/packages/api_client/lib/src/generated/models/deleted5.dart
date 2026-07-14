// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

part 'deleted5.g.dart';

@JsonSerializable()
class Deleted5 {
  const Deleted5({
    required this.ids,
    required this.deleted,
    this.object = 'price',
  });

  factory Deleted5.fromJson(Map<String, Object?> json) =>
      _$Deleted5FromJson(json);

  /// The IDs of the deleted prices.
  final List<String> ids;

  /// The name of the deleted object.
  final String object;

  /// Whether the prices were deleted.
  final bool deleted;

  Map<String, Object?> toJson() => _$Deleted5ToJson(this);
}
