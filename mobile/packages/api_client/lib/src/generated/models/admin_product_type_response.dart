// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'admin_product_type.dart';

part 'admin_product_type_response.g.dart';

/// The product type's details.
@JsonSerializable()
class AdminProductTypeResponse {
  const AdminProductTypeResponse({required this.productType});

  factory AdminProductTypeResponse.fromJson(Map<String, Object?> json) =>
      _$AdminProductTypeResponseFromJson(json);

  @JsonKey(name: 'product_type')
  final AdminProductType productType;

  Map<String, Object?> toJson() => _$AdminProductTypeResponseToJson(this);
}
