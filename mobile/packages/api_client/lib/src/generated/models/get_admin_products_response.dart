// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

part 'get_admin_products_response.g.dart';

@JsonSerializable()
class GetAdminProductsResponse {
  const GetAdminProductsResponse({
    required this.limit,
    required this.offset,
    required this.count,
    required this.products,
  });

  factory GetAdminProductsResponse.fromJson(Map<String, Object?> json) =>
      _$GetAdminProductsResponseFromJson(json);

  /// The maximum number of items returned.
  final num limit;

  /// The number of items skipped before retrieving the returned items.
  final num offset;

  /// The total number of items.
  final num count;

  /// The list of products.
  final List<dynamic> products;

  Map<String, Object?> toJson() => _$GetAdminProductsResponseToJson(this);
}
