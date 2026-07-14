// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'admin_translation.dart';

part 'data.g.dart';

@JsonSerializable()
class Data {
  const Data({required this.id, required this.translations});

  factory Data.fromJson(Map<String, Object?> json) => _$DataFromJson(json);

  /// The entity's ID.
  final String id;

  /// The entity's translations.
  final List<AdminTranslation> translations;

  Map<String, Object?> toJson() => _$DataToJson(this);
}
