// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_price_preference_delete_response.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AdminPricePreferenceDeleteResponse _$AdminPricePreferenceDeleteResponseFromJson(
  Map<String, dynamic> json,
) => AdminPricePreferenceDeleteResponse(
  id: json['id'] as String,
  deleted: json['deleted'] as bool,
  object: json['object'] as String? ?? 'price_preference',
);

Map<String, dynamic> _$AdminPricePreferenceDeleteResponseToJson(
  AdminPricePreferenceDeleteResponse instance,
) => <String, dynamic>{
  'id': instance.id,
  'object': instance.object,
  'deleted': instance.deleted,
};
