// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_upload_pre_signed_url_response.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AdminUploadPreSignedUrlResponse _$AdminUploadPreSignedUrlResponseFromJson(
  Map<String, dynamic> json,
) => AdminUploadPreSignedUrlResponse(
  url: json['url'] as String,
  filename: json['filename'] as String,
  originalname: json['originalname'] as String,
  mimeType: json['mime_type'] as String,
  extensionValue: json['extension'] as String,
  size: json['size'] as num,
);

Map<String, dynamic> _$AdminUploadPreSignedUrlResponseToJson(
  AdminUploadPreSignedUrlResponse instance,
) => <String, dynamic>{
  'url': instance.url,
  'filename': instance.filename,
  'originalname': instance.originalname,
  'mime_type': instance.mimeType,
  'extension': instance.extensionValue,
  'size': instance.size,
};
