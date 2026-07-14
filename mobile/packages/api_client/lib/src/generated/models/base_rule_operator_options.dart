// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

part 'base_rule_operator_options.g.dart';

/// The operator's details.
@JsonSerializable()
class BaseRuleOperatorOptions {
  const BaseRuleOperatorOptions({
    required this.id,
    required this.value,
    required this.label,
  });

  factory BaseRuleOperatorOptions.fromJson(Map<String, Object?> json) =>
      _$BaseRuleOperatorOptionsFromJson(json);

  /// The operator's ID.
  final String id;

  /// The operator's value.
  final String value;

  /// The operator's label.
  final String label;

  Map<String, Object?> toJson() => _$BaseRuleOperatorOptionsToJson(this);
}
