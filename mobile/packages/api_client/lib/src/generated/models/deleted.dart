// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

part 'deleted.g.dart';

@JsonSerializable()
class Deleted {
  const Deleted({
    required this.ids,
    required this.deleted,
    this.object = 'product',
  });

  factory Deleted.fromJson(Map<String, Object?> json) =>
      _$DeletedFromJson(json);

  /// The IDs of deleted products.
  final List<String> ids;

  /// The name of the deleted objects.
  final String object;

  /// Whether the products were deleted.
  final bool deleted;

  Map<String, Object?> toJson() => _$DeletedToJson(this);
}
