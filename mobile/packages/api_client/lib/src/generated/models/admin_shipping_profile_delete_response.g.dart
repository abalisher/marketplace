// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_shipping_profile_delete_response.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AdminShippingProfileDeleteResponse _$AdminShippingProfileDeleteResponseFromJson(
  Map<String, dynamic> json,
) => AdminShippingProfileDeleteResponse(
  id: json['id'] as String,
  deleted: json['deleted'] as bool,
  object: json['object'] as String? ?? 'shipping_profile',
);

Map<String, dynamic> _$AdminShippingProfileDeleteResponseToJson(
  AdminShippingProfileDeleteResponse instance,
) => <String, dynamic>{
  'id': instance.id,
  'object': instance.object,
  'deleted': instance.deleted,
};
