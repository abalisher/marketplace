// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_fulfillment_set_delete_response.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AdminFulfillmentSetDeleteResponse _$AdminFulfillmentSetDeleteResponseFromJson(
  Map<String, dynamic> json,
) => AdminFulfillmentSetDeleteResponse(
  id: json['id'] as String,
  deleted: json['deleted'] as bool,
  object: json['object'] as String? ?? 'fulfillment_set',
);

Map<String, dynamic> _$AdminFulfillmentSetDeleteResponseToJson(
  AdminFulfillmentSetDeleteResponse instance,
) => <String, dynamic>{
  'id': instance.id,
  'object': instance.object,
  'deleted': instance.deleted,
};
