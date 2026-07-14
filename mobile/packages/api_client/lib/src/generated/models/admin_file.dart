// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

part 'admin_file.g.dart';

/// A file's details.
@JsonSerializable()
class AdminFile {
  const AdminFile({required this.id, required this.url});

  factory AdminFile.fromJson(Map<String, Object?> json) =>
      _$AdminFileFromJson(json);

  /// The file's ID.
  final String id;

  /// The file's URL.
  final String url;

  Map<String, Object?> toJson() => _$AdminFileToJson(this);
}
