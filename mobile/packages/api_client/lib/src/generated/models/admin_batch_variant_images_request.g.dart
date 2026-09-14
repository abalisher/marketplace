// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_batch_variant_images_request.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AdminBatchVariantImagesRequest _$AdminBatchVariantImagesRequestFromJson(
  Map<String, dynamic> json,
) => AdminBatchVariantImagesRequest(
  add: (json['add'] as List<dynamic>?)?.map((e) => e as String).toList(),
  remove: (json['remove'] as List<dynamic>?)?.map((e) => e as String).toList(),
);

Map<String, dynamic> _$AdminBatchVariantImagesRequestToJson(
  AdminBatchVariantImagesRequest instance,
) => <String, dynamic>{'add': ?instance.add, 'remove': ?instance.remove};
