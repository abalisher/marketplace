// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'admin_property_label.dart';

part 'admin_property_label_response.g.dart';

/// The details of a property label.
@JsonSerializable()
class AdminPropertyLabelResponse {
  const AdminPropertyLabelResponse({required this.propertyLabel});

  factory AdminPropertyLabelResponse.fromJson(Map<String, Object?> json) =>
      _$AdminPropertyLabelResponseFromJson(json);

  @JsonKey(name: 'property_label')
  final AdminPropertyLabel propertyLabel;

  Map<String, Object?> toJson() => _$AdminPropertyLabelResponseToJson(this);
}
