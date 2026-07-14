// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'admin_product_variant.dart';

part 'admin_product_variant_response.g.dart';

/// The product variant's details.
@JsonSerializable()
class AdminProductVariantResponse {
  const AdminProductVariantResponse({required this.variant});

  factory AdminProductVariantResponse.fromJson(Map<String, Object?> json) =>
      _$AdminProductVariantResponseFromJson(json);

  final AdminProductVariant variant;

  Map<String, Object?> toJson() => _$AdminProductVariantResponseToJson(this);
}
