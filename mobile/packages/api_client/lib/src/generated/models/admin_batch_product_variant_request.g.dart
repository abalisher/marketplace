// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_batch_product_variant_request.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AdminBatchProductVariantRequest _$AdminBatchProductVariantRequestFromJson(
  Map<String, dynamic> json,
) => AdminBatchProductVariantRequest(
  create: (json['create'] as List<dynamic>?)
      ?.map(
        (e) => AdminCreateProductVariant.fromJson(e as Map<String, dynamic>),
      )
      .toList(),
  update: (json['update'] as List<dynamic>?)
      ?.map(
        (e) =>
            AdminBatchUpdateProductVariant.fromJson(e as Map<String, dynamic>),
      )
      .toList(),
  delete: (json['delete'] as List<dynamic>?)?.map((e) => e as String).toList(),
);

Map<String, dynamic> _$AdminBatchProductVariantRequestToJson(
  AdminBatchProductVariantRequest instance,
) => <String, dynamic>{
  'create': instance.create,
  'update': instance.update,
  'delete': instance.delete,
};
