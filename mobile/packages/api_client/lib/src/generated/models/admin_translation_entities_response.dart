// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'data.dart';

part 'admin_translation_entities_response.g.dart';

/// The list of translatable entities.
@JsonSerializable()
class AdminTranslationEntitiesResponse {
  const AdminTranslationEntitiesResponse({
    required this.data,
    required this.count,
    required this.offset,
    required this.limit,
  });

  factory AdminTranslationEntitiesResponse.fromJson(
    Map<String, Object?> json,
  ) => _$AdminTranslationEntitiesResponseFromJson(json);

  /// The list of translatable entities.
  final List<Data> data;

  /// The total number of translatable entities.
  final num count;

  /// The number of items skipped before retrieving the returned items.
  final num offset;

  /// The maximum number of items returned in the response.
  final num limit;

  Map<String, Object?> toJson() =>
      _$AdminTranslationEntitiesResponseToJson(this);
}
