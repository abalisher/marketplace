// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_shipping_option_delete_response.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AdminShippingOptionDeleteResponse _$AdminShippingOptionDeleteResponseFromJson(
  Map<String, dynamic> json,
) => AdminShippingOptionDeleteResponse(
  id: json['id'] as String,
  deleted: json['deleted'] as bool,
  object: json['object'] as String? ?? 'shipping_option',
);

Map<String, dynamic> _$AdminShippingOptionDeleteResponseToJson(
  AdminShippingOptionDeleteResponse instance,
) => <String, dynamic>{
  'id': instance.id,
  'object': instance.object,
  'deleted': instance.deleted,
};
