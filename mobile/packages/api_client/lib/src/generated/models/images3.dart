// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

part 'images3.g.dart';

@JsonSerializable()
class Images3 {
  const Images3({required this.url});

  factory Images3.fromJson(Map<String, Object?> json) =>
      _$Images3FromJson(json);

  /// The image's URL.
  final String url;

  Map<String, Object?> toJson() => _$Images3ToJson(this);
}
