// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_batch_variant_inventory_items.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AdminBatchVariantInventoryItems _$AdminBatchVariantInventoryItemsFromJson(
  Map<String, dynamic> json,
) => AdminBatchVariantInventoryItems(
  create: (json['create'] as List<dynamic>?)
      ?.map(
        (e) => AdminBatchCreateVariantInventoryItem.fromJson(
          e as Map<String, dynamic>,
        ),
      )
      .toList(),
  update: (json['update'] as List<dynamic>?)
      ?.map(
        (e) => AdminBatchUpdateVariantInventoryItem.fromJson(
          e as Map<String, dynamic>,
        ),
      )
      .toList(),
  delete: (json['delete'] as List<dynamic>?)
      ?.map(
        (e) => AdminBatchDeleteVariantInventoryItem.fromJson(
          e as Map<String, dynamic>,
        ),
      )
      .toList(),
);

Map<String, dynamic> _$AdminBatchVariantInventoryItemsToJson(
  AdminBatchVariantInventoryItems instance,
) => <String, dynamic>{
  'create': instance.create,
  'update': instance.update,
  'delete': instance.delete,
};
