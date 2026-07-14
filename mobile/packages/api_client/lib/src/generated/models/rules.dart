// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'operator_enum.dart';

part 'rules.g.dart';

@JsonSerializable()
class Rules {
  const Rules({
    required this.attribute,
    required this.operatorEnum,
    required this.value,
  });

  factory Rules.fromJson(Map<String, Object?> json) => _$RulesFromJson(json);

  /// The rule's attribute.
  final String attribute;

  /// The rule's operator.
  /// The name has been replaced because it contains a keyword. Original name: `operator`.
  @JsonKey(name: 'operator')
  final OperatorEnum operatorEnum;

  /// The rule's value.
  final num value;

  Map<String, Object?> toJson() => _$RulesToJson(this);
}
