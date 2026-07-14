// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

part 'source.g.dart';

@JsonSerializable()
class Source {
  const Source({required this.module, required this.entity});

  factory Source.fromJson(Map<String, Object?> json) => _$SourceFromJson(json);

  /// The source's module.
  final String module;

  /// The source's entity.
  final String entity;

  Map<String, Object?> toJson() => _$SourceToJson(this);
}
