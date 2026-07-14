// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'admin_product_tag.dart';

part 'admin_product_tag_response.g.dart';

/// The product tag's details.
@JsonSerializable()
class AdminProductTagResponse {
  const AdminProductTagResponse({required this.productTag});

  factory AdminProductTagResponse.fromJson(Map<String, Object?> json) =>
      _$AdminProductTagResponseFromJson(json);

  @JsonKey(name: 'product_tag')
  final AdminProductTag productTag;

  Map<String, Object?> toJson() => _$AdminProductTagResponseToJson(this);
}
