// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'admin_tax_rate.dart';

part 'admin_tax_rate_response.g.dart';

/// The tax rate's details.
@JsonSerializable()
class AdminTaxRateResponse {
  const AdminTaxRateResponse({required this.taxRate});

  factory AdminTaxRateResponse.fromJson(Map<String, Object?> json) =>
      _$AdminTaxRateResponseFromJson(json);

  @JsonKey(name: 'tax_rate')
  final AdminTaxRate taxRate;

  Map<String, Object?> toJson() => _$AdminTaxRateResponseToJson(this);
}
