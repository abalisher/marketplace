// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

part 'admin_tax_rate_rule.g.dart';

/// The tax rate rule's details.
@JsonSerializable()
class AdminTaxRateRule {
  const AdminTaxRateRule({
    required this.reference,
    required this.referenceId,
    required this.createdAt,
  });

  factory AdminTaxRateRule.fromJson(Map<String, Object?> json) =>
      _$AdminTaxRateRuleFromJson(json);

  /// The name of the table this rule references.
  final String reference;

  /// The ID of a record in the table that this rule references.
  @JsonKey(name: 'reference_id')
  final String referenceId;

  /// The date the tax rate rule was created.
  @JsonKey(name: 'created_at')
  final DateTime createdAt;

  Map<String, Object?> toJson() => _$AdminTaxRateRuleToJson(this);
}
