// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

part 'admin_product_type_delete_response.g.dart';

/// The details of the product type deletion.
@JsonSerializable()
class AdminProductTypeDeleteResponse {
  const AdminProductTypeDeleteResponse({
    required this.id,
    required this.deleted,
    this.object = 'product_type',
  });

  factory AdminProductTypeDeleteResponse.fromJson(Map<String, Object?> json) =>
      _$AdminProductTypeDeleteResponseFromJson(json);

  /// The product type's ID.
  final String id;

  /// The name of the deleted object.
  final String object;

  /// Whether the product type was deleted.
  final bool deleted;

  Map<String, Object?> toJson() => _$AdminProductTypeDeleteResponseToJson(this);
}
