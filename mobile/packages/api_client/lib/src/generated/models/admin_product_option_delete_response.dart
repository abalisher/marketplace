// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'admin_product.dart';

part 'admin_product_option_delete_response.g.dart';

/// The details of the product option deletion.
@JsonSerializable()
class AdminProductOptionDeleteResponse {
  const AdminProductOptionDeleteResponse({
    required this.id,
    required this.deleted,
    this.parent,
    this.object = 'product_option',
  });

  factory AdminProductOptionDeleteResponse.fromJson(
    Map<String, Object?> json,
  ) => _$AdminProductOptionDeleteResponseFromJson(json);

  /// The product option's ID.
  final String id;

  /// The name of the deleted object.
  final String object;

  /// Whether the product option was deleted.
  final bool deleted;
  final AdminProduct? parent;

  Map<String, Object?> toJson() =>
      _$AdminProductOptionDeleteResponseToJson(this);
}
