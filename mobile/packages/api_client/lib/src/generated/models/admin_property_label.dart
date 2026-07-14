// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

part 'admin_property_label.g.dart';

/// The property label's details.
@JsonSerializable()
class AdminPropertyLabel {
  const AdminPropertyLabel({
    required this.id,
    required this.entity,
    required this.property,
    required this.label,
    required this.createdAt,
    required this.updatedAt,
    this.description,
  });

  factory AdminPropertyLabel.fromJson(Map<String, Object?> json) =>
      _$AdminPropertyLabelFromJson(json);

  /// The property label's ID.
  final String id;

  /// The entity the property label belongs to.
  final String entity;

  /// The property the label is associated with.
  final String property;

  /// The label for the property.
  final String label;

  /// The property label's description.
  final String? description;

  /// The date the property label was created.
  @JsonKey(name: 'created_at')
  final DateTime createdAt;

  /// The date the property label was last updated.
  @JsonKey(name: 'updated_at')
  final DateTime updatedAt;

  Map<String, Object?> toJson() => _$AdminPropertyLabelToJson(this);
}
