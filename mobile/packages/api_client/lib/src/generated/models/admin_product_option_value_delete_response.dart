// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'admin_product_option.dart';

part 'admin_product_option_value_delete_response.g.dart';

/// The details of the product option value deletion.
@JsonSerializable()
class AdminProductOptionValueDeleteResponse {
  const AdminProductOptionValueDeleteResponse({
    required this.id,
    required this.deleted,
    this.parent,
    this.object = 'product_option_value',
  });

  factory AdminProductOptionValueDeleteResponse.fromJson(
    Map<String, Object?> json,
  ) => _$AdminProductOptionValueDeleteResponseFromJson(json);

  /// The ID of the deleted product option value.
  final String id;

  /// The name of the deleted object.
  final String object;

  /// Whether the Product Option Value was deleted.
  final bool deleted;
  final AdminProductOption? parent;

  Map<String, Object?> toJson() =>
      _$AdminProductOptionValueDeleteResponseToJson(this);
}
