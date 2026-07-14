// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_shipping_option_type_delete_response.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AdminShippingOptionTypeDeleteResponse
_$AdminShippingOptionTypeDeleteResponseFromJson(Map<String, dynamic> json) =>
    AdminShippingOptionTypeDeleteResponse(
      id: json['id'] as String,
      deleted: json['deleted'] as bool,
      object: json['object'] as String? ?? 'shipping_option_type',
    );

Map<String, dynamic> _$AdminShippingOptionTypeDeleteResponseToJson(
  AdminShippingOptionTypeDeleteResponse instance,
) => <String, dynamic>{
  'id': instance.id,
  'object': instance.object,
  'deleted': instance.deleted,
};
