// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_product_variant_inventory_link_delete_response.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AdminProductVariantInventoryLinkDeleteResponse
_$AdminProductVariantInventoryLinkDeleteResponseFromJson(
  Map<String, dynamic> json,
) => AdminProductVariantInventoryLinkDeleteResponse(
  id: AdminProductVariantInventoryLink.fromJson(
    json['id'] as Map<String, dynamic>,
  ),
  deleted: json['deleted'] as bool,
  parent: AdminProductVariant.fromJson(json['parent'] as Map<String, dynamic>),
  object: json['object'] as String? ?? 'variant-inventory-item-link',
);

Map<String, dynamic> _$AdminProductVariantInventoryLinkDeleteResponseToJson(
  AdminProductVariantInventoryLinkDeleteResponse instance,
) => <String, dynamic>{
  'id': instance.id,
  'object': instance.object,
  'deleted': instance.deleted,
  'parent': instance.parent,
};
