// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_price_list_delete_response.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AdminPriceListDeleteResponse _$AdminPriceListDeleteResponseFromJson(
  Map<String, dynamic> json,
) => AdminPriceListDeleteResponse(
  id: json['id'] as String,
  deleted: json['deleted'] as bool,
  object: json['object'] as String? ?? 'price_list',
);

Map<String, dynamic> _$AdminPriceListDeleteResponseToJson(
  AdminPriceListDeleteResponse instance,
) => <String, dynamic>{
  'id': instance.id,
  'object': instance.object,
  'deleted': instance.deleted,
};
