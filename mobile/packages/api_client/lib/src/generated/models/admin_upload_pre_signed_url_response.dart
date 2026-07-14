// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

part 'admin_upload_pre_signed_url_response.g.dart';

/// The result of the pre-signed URL upload request.
@JsonSerializable()
class AdminUploadPreSignedUrlResponse {
  const AdminUploadPreSignedUrlResponse({
    required this.url,
    required this.filename,
    required this.originalname,
    required this.mimeType,
    required this.extensionValue,
    required this.size,
  });

  factory AdminUploadPreSignedUrlResponse.fromJson(Map<String, Object?> json) =>
      _$AdminUploadPreSignedUrlResponseFromJson(json);

  /// The file's pre-signed upload URL.
  final String url;

  /// The file's filename.
  final String filename;

  /// The file's orignal name.
  final String originalname;

  /// The file's mime type.
  @JsonKey(name: 'mime_type')
  final String mimeType;

  /// The file's extension.
  /// The name has been replaced because it contains a keyword. Original name: `extension`.
  @JsonKey(name: 'extension')
  final String extensionValue;

  /// The file's size in bytes.
  final num size;

  Map<String, Object?> toJson() =>
      _$AdminUploadPreSignedUrlResponseToJson(this);
}
