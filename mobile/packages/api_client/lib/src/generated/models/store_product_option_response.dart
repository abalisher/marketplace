// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'store_product_option.dart';

part 'store_product_option_response.g.dart';

/// The product option's details.
@JsonSerializable()
class StoreProductOptionResponse {
  const StoreProductOptionResponse({required this.productOption});

  factory StoreProductOptionResponse.fromJson(Map<String, Object?> json) =>
      _$StoreProductOptionResponseFromJson(json);

  @JsonKey(name: 'product_option')
  final StoreProductOption productOption;

  Map<String, Object?> toJson() => _$StoreProductOptionResponseToJson(this);
}
