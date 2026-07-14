// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_batch_image_variant_response.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AdminBatchImageVariantResponse _$AdminBatchImageVariantResponseFromJson(
  Map<String, dynamic> json,
) => AdminBatchImageVariantResponse(
  added: (json['added'] as List<dynamic>).map((e) => e as String).toList(),
  removed: (json['removed'] as List<dynamic>).map((e) => e as String).toList(),
);

Map<String, dynamic> _$AdminBatchImageVariantResponseToJson(
  AdminBatchImageVariantResponse instance,
) => <String, dynamic>{'added': instance.added, 'removed': instance.removed};
