// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'admin_tax_region.dart';

part 'admin_tax_region_response.g.dart';

/// The tax region's details.
@JsonSerializable()
class AdminTaxRegionResponse {
  const AdminTaxRegionResponse({required this.taxRegion});

  factory AdminTaxRegionResponse.fromJson(Map<String, Object?> json) =>
      _$AdminTaxRegionResponseFromJson(json);

  @JsonKey(name: 'tax_region')
  final AdminTaxRegion taxRegion;

  Map<String, Object?> toJson() => _$AdminTaxRegionResponseToJson(this);
}
