// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'admin_file.dart';

part 'admin_file_response.g.dart';

/// A file's details.
@JsonSerializable()
class AdminFileResponse {
  const AdminFileResponse({required this.file});

  factory AdminFileResponse.fromJson(Map<String, Object?> json) =>
      _$AdminFileResponseFromJson(json);

  final AdminFile file;

  Map<String, Object?> toJson() => _$AdminFileResponseToJson(this);
}
