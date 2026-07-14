// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

part 'admin_collection_delete_response.g.dart';

/// The details of the deleted collection.
@JsonSerializable()
class AdminCollectionDeleteResponse {
  const AdminCollectionDeleteResponse({
    required this.id,
    required this.deleted,
    this.object = 'collection',
  });

  factory AdminCollectionDeleteResponse.fromJson(Map<String, Object?> json) =>
      _$AdminCollectionDeleteResponseFromJson(json);

  /// The collection's ID.
  final String id;

  /// The name of the deleted object.
  final String object;

  /// Whether the collection was deleted.
  final bool deleted;

  Map<String, Object?> toJson() => _$AdminCollectionDeleteResponseToJson(this);
}
