// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_tax_rate_rule.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AdminTaxRateRule _$AdminTaxRateRuleFromJson(Map<String, dynamic> json) =>
    AdminTaxRateRule(
      reference: json['reference'] as String,
      referenceId: json['reference_id'] as String,
      createdAt: DateTime.parse(json['created_at'] as String),
    );

Map<String, dynamic> _$AdminTaxRateRuleToJson(AdminTaxRateRule instance) =>
    <String, dynamic>{
      'reference': instance.reference,
      'reference_id': instance.referenceId,
      'created_at': instance.createdAt.toIso8601String(),
    };
