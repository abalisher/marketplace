// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

part 'admin_update_property_label.g.dart';

/// The details to update in a property label.
@JsonSerializable()
class AdminUpdatePropertyLabel {
  const AdminUpdatePropertyLabel({this.label, this.description});

  factory AdminUpdatePropertyLabel.fromJson(Map<String, Object?> json) =>
      _$AdminUpdatePropertyLabelFromJson(json);

  /// The label of the property.
  final String? label;

  /// The property label's description.
  final String? description;

  Map<String, Object?> toJson() => _$AdminUpdatePropertyLabelToJson(this);
}
