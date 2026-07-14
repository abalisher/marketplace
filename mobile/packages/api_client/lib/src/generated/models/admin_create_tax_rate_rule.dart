// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

part 'admin_create_tax_rate_rule.g.dart';

/// The tax rate rule's details.
@JsonSerializable()
class AdminCreateTaxRateRule {
  const AdminCreateTaxRateRule({
    required this.reference,
    required this.referenceId,
  });

  factory AdminCreateTaxRateRule.fromJson(Map<String, Object?> json) =>
      _$AdminCreateTaxRateRuleFromJson(json);

  /// The name of a table in the database that this rule points to.
  final String reference;

  /// The ID of a record in the table specified in reference.
  @JsonKey(name: 'reference_id')
  final String referenceId;

  Map<String, Object?> toJson() => _$AdminCreateTaxRateRuleToJson(this);
}
