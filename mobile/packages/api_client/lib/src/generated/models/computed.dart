// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

part 'computed.g.dart';

@JsonSerializable()
class Computed {
  const Computed({
    required this.type,
    required this.requiredFields,
    required this.optionalFields,
  });

  factory Computed.fromJson(Map<String, Object?> json) =>
      _$ComputedFromJson(json);

  /// The computed's type for rendering.
  final String type;

  /// The required fields in the computed column.
  @JsonKey(name: 'required_fields')
  final List<String> requiredFields;

  /// The optional fields in the computed column.
  @JsonKey(name: 'optional_fields')
  final List<String> optionalFields;

  Map<String, Object?> toJson() => _$ComputedToJson(this);
}
