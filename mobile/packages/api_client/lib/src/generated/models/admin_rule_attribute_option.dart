// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'base_rule_operator_options.dart';

part 'admin_rule_attribute_option.g.dart';

/// The details of a potential rule attribute.
@JsonSerializable()
class AdminRuleAttributeOption {
  const AdminRuleAttributeOption({
    required this.id,
    required this.value,
    required this.label,
    required this.operators,
  });

  factory AdminRuleAttributeOption.fromJson(Map<String, Object?> json) =>
      _$AdminRuleAttributeOptionFromJson(json);

  /// The rule attribute's ID, which is a rule's `attribute` it refers to.
  final String id;

  /// The rule attribute's value.
  final String value;

  /// The rule attribute option's label.
  final String label;

  /// The attribute's operators.
  final List<BaseRuleOperatorOptions> operators;

  Map<String, Object?> toJson() => _$AdminRuleAttributeOptionToJson(this);
}
