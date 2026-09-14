// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_batch_image_variant_request.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AdminBatchImageVariantRequest _$AdminBatchImageVariantRequestFromJson(
  Map<String, dynamic> json,
) => AdminBatchImageVariantRequest(
  add: (json['add'] as List<dynamic>?)?.map((e) => e as String).toList(),
  remove: (json['remove'] as List<dynamic>?)?.map((e) => e as String).toList(),
);

Map<String, dynamic> _$AdminBatchImageVariantRequestToJson(
  AdminBatchImageVariantRequest instance,
) => <String, dynamic>{'add': ?instance.add, 'remove': ?instance.remove};
