// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

part 'version.g.dart';

@JsonSerializable()
class Version {
  const Version({required this.from, required this.to});

  factory Version.fromJson(Map<String, Object?> json) =>
      _$VersionFromJson(json);

  /// The original version.
  final num from;

  /// The new version.
  final num to;

  Map<String, Object?> toJson() => _$VersionToJson(this);
}
