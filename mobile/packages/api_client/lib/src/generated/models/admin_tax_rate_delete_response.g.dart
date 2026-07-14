// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_tax_rate_delete_response.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AdminTaxRateDeleteResponse _$AdminTaxRateDeleteResponseFromJson(
  Map<String, dynamic> json,
) => AdminTaxRateDeleteResponse(
  id: json['id'] as String,
  deleted: json['deleted'] as bool,
  object: json['object'] as String? ?? 'tax_rate',
);

Map<String, dynamic> _$AdminTaxRateDeleteResponseToJson(
  AdminTaxRateDeleteResponse instance,
) => <String, dynamic>{
  'id': instance.id,
  'object': instance.object,
  'deleted': instance.deleted,
};
