// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_post_order_edits_add_items_req_schema.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AdminPostOrderEditsAddItemsReqSchema
_$AdminPostOrderEditsAddItemsReqSchemaFromJson(Map<String, dynamic> json) =>
    AdminPostOrderEditsAddItemsReqSchema(
      items: (json['items'] as List<dynamic>?)
          ?.map((e) => Items7.fromJson(e as Map<String, dynamic>))
          .toList(),
    );

Map<String, dynamic> _$AdminPostOrderEditsAddItemsReqSchemaToJson(
  AdminPostOrderEditsAddItemsReqSchema instance,
) => <String, dynamic>{'items': ?instance.items};
