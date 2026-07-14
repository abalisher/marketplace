// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_batch_variant_images_response.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AdminBatchVariantImagesResponse _$AdminBatchVariantImagesResponseFromJson(
  Map<String, dynamic> json,
) => AdminBatchVariantImagesResponse(
  added: (json['added'] as List<dynamic>).map((e) => e as String).toList(),
  removed: (json['removed'] as List<dynamic>).map((e) => e as String).toList(),
);

Map<String, dynamic> _$AdminBatchVariantImagesResponseToJson(
  AdminBatchVariantImagesResponse instance,
) => <String, dynamic>{'added': instance.added, 'removed': instance.removed};
