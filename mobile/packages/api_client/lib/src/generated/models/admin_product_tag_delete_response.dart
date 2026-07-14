// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

part 'admin_product_tag_delete_response.g.dart';

/// The details of the product tag deletion.
@JsonSerializable()
class AdminProductTagDeleteResponse {
  const AdminProductTagDeleteResponse({
    required this.id,
    required this.deleted,
    this.object = 'product_tag',
  });

  factory AdminProductTagDeleteResponse.fromJson(Map<String, Object?> json) =>
      _$AdminProductTagDeleteResponseFromJson(json);

  /// The product tag's ID.
  final String id;

  /// The name of the deleted object.
  final String object;

  /// Whether the product tag was deleted.
  final bool deleted;

  Map<String, Object?> toJson() => _$AdminProductTagDeleteResponseToJson(this);
}
