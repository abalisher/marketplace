// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

part 'update.g.dart';

@JsonSerializable()
class Update {
  const Update({required this.id, this.label, this.description});

  factory Update.fromJson(Map<String, Object?> json) => _$UpdateFromJson(json);

  /// The ID of the property label to update.
  final String id;

  /// The updated label of the property label.
  final String? label;

  /// The updated description of the property label.
  final String? description;

  Map<String, Object?> toJson() => _$UpdateToJson(this);
}
