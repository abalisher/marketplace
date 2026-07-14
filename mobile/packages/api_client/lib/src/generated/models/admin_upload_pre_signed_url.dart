// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'admin_upload_pre_signed_url_access.dart';

part 'admin_upload_pre_signed_url.g.dart';

/// The details of the file to upload.
@JsonSerializable()
class AdminUploadPreSignedUrl {
  const AdminUploadPreSignedUrl({
    required this.originalname,
    required this.size,
    required this.mimeType,
    this.access,
  });

  factory AdminUploadPreSignedUrl.fromJson(Map<String, Object?> json) =>
      _$AdminUploadPreSignedUrlFromJson(json);

  /// The file's original name.
  final String originalname;

  /// The file's size in bytes.
  final num size;

  /// The file's mime type.
  @JsonKey(name: 'mime_type')
  final String mimeType;

  /// The access level of the file. If `private`, the file will not be publicly accessible. The default value depends on the configured File Module Provider.
  final AdminUploadPreSignedUrlAccess? access;

  Map<String, Object?> toJson() => _$AdminUploadPreSignedUrlToJson(this);
}
