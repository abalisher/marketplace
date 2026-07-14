// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'admin_product_option_value.dart';

part 'admin_product_option_value_response.g.dart';

/// The details of a product option value.
@JsonSerializable()
class AdminProductOptionValueResponse {
  const AdminProductOptionValueResponse({required this.productOptionValue});

  factory AdminProductOptionValueResponse.fromJson(Map<String, Object?> json) =>
      _$AdminProductOptionValueResponseFromJson(json);

  @JsonKey(name: 'product_option_value')
  final AdminProductOptionValue productOptionValue;

  Map<String, Object?> toJson() =>
      _$AdminProductOptionValueResponseToJson(this);
}
