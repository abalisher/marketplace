// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'admin_product_variant.dart';
import 'admin_product_variant_inventory_link.dart';

part 'admin_product_variant_inventory_link_delete_response.g.dart';

/// The details of the deleted associated between a product variant and an inventory item.
@JsonSerializable()
class AdminProductVariantInventoryLinkDeleteResponse {
  const AdminProductVariantInventoryLinkDeleteResponse({
    required this.id,
    required this.deleted,
    required this.parent,
    this.object = 'variant-inventory-item-link',
  });

  factory AdminProductVariantInventoryLinkDeleteResponse.fromJson(
    Map<String, Object?> json,
  ) => _$AdminProductVariantInventoryLinkDeleteResponseFromJson(json);

  final AdminProductVariantInventoryLink id;

  /// The name of the deleted object.
  final String object;

  /// Whether the association was deleted.
  final bool deleted;
  final AdminProductVariant parent;

  Map<String, Object?> toJson() =>
      _$AdminProductVariantInventoryLinkDeleteResponseToJson(this);
}
