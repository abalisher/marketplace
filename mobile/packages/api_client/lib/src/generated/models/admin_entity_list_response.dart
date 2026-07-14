// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'admin_entity_info.dart';

part 'admin_entity_list_response.g.dart';

/// The list of entities in the view.
@JsonSerializable()
class AdminEntityListResponse {
  const AdminEntityListResponse({required this.entities});

  factory AdminEntityListResponse.fromJson(Map<String, Object?> json) =>
      _$AdminEntityListResponseFromJson(json);

  /// The list of entities.
  final List<AdminEntityInfo> entities;

  Map<String, Object?> toJson() => _$AdminEntityListResponseToJson(this);
}
