// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_import_products.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AdminImportProducts _$AdminImportProductsFromJson(Map<String, dynamic> json) =>
    AdminImportProducts(
      fileKey: json['file_key'] as String,
      originalname: json['originalname'] as String,
      extensionValue: json['extension'] as String,
      size: json['size'] as num,
      mimeType: json['mime_type'] as String,
    );

Map<String, dynamic> _$AdminImportProductsToJson(
  AdminImportProducts instance,
) => <String, dynamic>{
  'file_key': instance.fileKey,
  'originalname': instance.originalname,
  'extension': instance.extensionValue,
  'size': instance.size,
  'mime_type': instance.mimeType,
};
