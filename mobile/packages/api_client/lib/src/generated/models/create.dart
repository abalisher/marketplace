// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

part 'create.g.dart';

@JsonSerializable()
class Create {
  const Create({
    required this.entity,
    required this.property,
    required this.label,
    this.description,
  });

  factory Create.fromJson(Map<String, Object?> json) => _$CreateFromJson(json);

  /// The name of the entity the property label belongs to.
  final String entity;

  /// The property the label is for.
  final String property;

  /// The label to use for the property.
  final String label;

  /// The description of the property label.
  final String? description;

  Map<String, Object?> toJson() => _$CreateToJson(this);
}
