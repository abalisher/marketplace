// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_tax_region_delete_response.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AdminTaxRegionDeleteResponse _$AdminTaxRegionDeleteResponseFromJson(
  Map<String, dynamic> json,
) => AdminTaxRegionDeleteResponse(
  id: json['id'] as String,
  deleted: json['deleted'] as bool,
  object: json['object'] as String? ?? 'tax_region',
);

Map<String, dynamic> _$AdminTaxRegionDeleteResponseToJson(
  AdminTaxRegionDeleteResponse instance,
) => <String, dynamic>{
  'id': instance.id,
  'object': instance.object,
  'deleted': instance.deleted,
};
