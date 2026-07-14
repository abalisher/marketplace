// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

part 'admin_rule_value_option.g.dart';

/// The details of a potential rule value.
@JsonSerializable()
class AdminRuleValueOption {
  const AdminRuleValueOption({required this.value, required this.label});

  factory AdminRuleValueOption.fromJson(Map<String, Object?> json) =>
      _$AdminRuleValueOptionFromJson(json);

  /// The rule value's value.
  final String value;

  /// The rule value's label.
  final String label;

  Map<String, Object?> toJson() => _$AdminRuleValueOptionToJson(this);
}
