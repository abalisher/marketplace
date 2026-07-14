// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_stock_location_delete_response.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AdminStockLocationDeleteResponse _$AdminStockLocationDeleteResponseFromJson(
  Map<String, dynamic> json,
) => AdminStockLocationDeleteResponse(
  id: json['id'] as String,
  deleted: json['deleted'] as bool,
  object: json['object'] as String? ?? 'stock_location',
);

Map<String, dynamic> _$AdminStockLocationDeleteResponseToJson(
  AdminStockLocationDeleteResponse instance,
) => <String, dynamic>{
  'id': instance.id,
  'object': instance.object,
  'deleted': instance.deleted,
};
