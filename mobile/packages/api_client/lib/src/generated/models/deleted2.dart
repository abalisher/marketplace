// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

part 'deleted2.g.dart';

@JsonSerializable()
class Deleted2 {
  const Deleted2({
    required this.ids,
    required this.deleted,
    this.object = 'variant',
  });

  factory Deleted2.fromJson(Map<String, Object?> json) =>
      _$Deleted2FromJson(json);

  /// The IDs of the deleted product variants.
  final List<String> ids;

  /// The name of the deleted objects.
  final String object;

  /// Whether the product variants were deleted.
  final bool deleted;

  Map<String, Object?> toJson() => _$Deleted2ToJson(this);
}
