// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'store_product_tag.dart';

part 'store_product_tag_response.g.dart';

/// The product tag's details.
@JsonSerializable()
class StoreProductTagResponse {
  const StoreProductTagResponse({required this.productTag});

  factory StoreProductTagResponse.fromJson(Map<String, Object?> json) =>
      _$StoreProductTagResponseFromJson(json);

  @JsonKey(name: 'product_tag')
  final StoreProductTag productTag;

  Map<String, Object?> toJson() => _$StoreProductTagResponseToJson(this);
}
