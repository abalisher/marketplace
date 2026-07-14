// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_exchange_delete_response.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AdminExchangeDeleteResponse _$AdminExchangeDeleteResponseFromJson(
  Map<String, dynamic> json,
) => AdminExchangeDeleteResponse(
  id: json['id'] as String,
  deleted: json['deleted'] as bool,
  object: json['object'] as String? ?? 'exchange',
);

Map<String, dynamic> _$AdminExchangeDeleteResponseToJson(
  AdminExchangeDeleteResponse instance,
) => <String, dynamic>{
  'id': instance.id,
  'object': instance.object,
  'deleted': instance.deleted,
};
