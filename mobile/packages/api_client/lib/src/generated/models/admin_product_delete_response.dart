// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

part 'admin_product_delete_response.g.dart';

/// The details of the product deletion.
@JsonSerializable()
class AdminProductDeleteResponse {
  const AdminProductDeleteResponse({
    required this.id,
    required this.deleted,
    this.object = 'product',
  });

  factory AdminProductDeleteResponse.fromJson(Map<String, Object?> json) =>
      _$AdminProductDeleteResponseFromJson(json);

  /// The product's ID.
  final String id;

  /// The name of the deleted object.
  final String object;

  /// Whether the product was deleted.
  final bool deleted;

  Map<String, Object?> toJson() => _$AdminProductDeleteResponseToJson(this);
}
