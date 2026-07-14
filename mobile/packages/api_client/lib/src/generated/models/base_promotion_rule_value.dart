// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

part 'base_promotion_rule_value.g.dart';

/// The rule value's details.
@JsonSerializable()
class BasePromotionRuleValue {
  const BasePromotionRuleValue({required this.id, this.value});

  factory BasePromotionRuleValue.fromJson(Map<String, Object?> json) =>
      _$BasePromotionRuleValueFromJson(json);

  /// The value's ID.
  final String id;

  /// The value.
  final String? value;

  Map<String, Object?> toJson() => _$BasePromotionRuleValueToJson(this);
}
