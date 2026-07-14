// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'admin_file.dart';

part 'admin_file_list_response.g.dart';

/// The list of uploaded files.
@JsonSerializable()
class AdminFileListResponse {
  const AdminFileListResponse({required this.files});

  factory AdminFileListResponse.fromJson(Map<String, Object?> json) =>
      _$AdminFileListResponseFromJson(json);

  /// The list of uploaded files.
  final List<AdminFile> files;

  Map<String, Object?> toJson() => _$AdminFileListResponseToJson(this);
}
