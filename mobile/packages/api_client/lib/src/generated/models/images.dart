// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

part 'images.g.dart';

@JsonSerializable()
class Images {
  const Images({required this.url, this.id});

  factory Images.fromJson(Map<String, Object?> json) => _$ImagesFromJson(json);

  /// The image's URL.
  final String url;

  /// The image's ID.
  final String? id;

  Map<String, Object?> toJson() => _$ImagesToJson(this);
}
