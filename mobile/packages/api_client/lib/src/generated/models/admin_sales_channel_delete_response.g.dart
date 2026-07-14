// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_sales_channel_delete_response.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AdminSalesChannelDeleteResponse _$AdminSalesChannelDeleteResponseFromJson(
  Map<String, dynamic> json,
) => AdminSalesChannelDeleteResponse(
  id: json['id'] as String,
  deleted: json['deleted'] as bool,
  object: json['object'] as String? ?? 'sales-channel',
);

Map<String, dynamic> _$AdminSalesChannelDeleteResponseToJson(
  AdminSalesChannelDeleteResponse instance,
) => <String, dynamic>{
  'id': instance.id,
  'object': instance.object,
  'deleted': instance.deleted,
};
