// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

part 'images2.g.dart';

@JsonSerializable()
class Images2 {
  const Images2({required this.url});

  factory Images2.fromJson(Map<String, Object?> json) =>
      _$Images2FromJson(json);

  /// The image's URL.
  final String url;

  Map<String, Object?> toJson() => _$Images2ToJson(this);
}
