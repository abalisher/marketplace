// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_upload_pre_signed_url.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AdminUploadPreSignedUrl _$AdminUploadPreSignedUrlFromJson(
  Map<String, dynamic> json,
) => AdminUploadPreSignedUrl(
  originalname: json['originalname'] as String,
  size: json['size'] as num,
  mimeType: json['mime_type'] as String,
  access: json['access'] == null
      ? null
      : AdminUploadPreSignedUrlAccess.fromJson(json['access'] as String),
);

Map<String, dynamic> _$AdminUploadPreSignedUrlToJson(
  AdminUploadPreSignedUrl instance,
) => <String, dynamic>{
  'originalname': instance.originalname,
  'size': instance.size,
  'mime_type': instance.mimeType,
  'access': ?_$AdminUploadPreSignedUrlAccessEnumMap[instance.access],
};

const _$AdminUploadPreSignedUrlAccessEnumMap = {
  AdminUploadPreSignedUrlAccess.public: 'public',
  AdminUploadPreSignedUrlAccess.private: 'private',
  AdminUploadPreSignedUrlAccess.$unknown: r'$unknown',
};
