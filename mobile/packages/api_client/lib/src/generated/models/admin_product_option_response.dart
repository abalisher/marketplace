// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'admin_product_option.dart';

part 'admin_product_option_response.g.dart';

/// The product option's details.
@JsonSerializable()
class AdminProductOptionResponse {
  const AdminProductOptionResponse({required this.productOption});

  factory AdminProductOptionResponse.fromJson(Map<String, Object?> json) =>
      _$AdminProductOptionResponseFromJson(json);

  @JsonKey(name: 'product_option')
  final AdminProductOption productOption;

  Map<String, Object?> toJson() => _$AdminProductOptionResponseToJson(this);
}
