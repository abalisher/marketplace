// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_post_returns_request_items_req_schema.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AdminPostReturnsRequestItemsReqSchema
_$AdminPostReturnsRequestItemsReqSchemaFromJson(Map<String, dynamic> json) =>
    AdminPostReturnsRequestItemsReqSchema(
      items: (json['items'] as List<dynamic>?)
          ?.map((e) => Items8.fromJson(e as Map<String, dynamic>))
          .toList(),
    );

Map<String, dynamic> _$AdminPostReturnsRequestItemsReqSchemaToJson(
  AdminPostReturnsRequestItemsReqSchema instance,
) => <String, dynamic>{'items': instance.items};
