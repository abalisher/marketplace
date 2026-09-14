// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'index_info.dart';

part 'admin_index_details_response.g.dart';

/// The index's metadata details.
@JsonSerializable()
class AdminIndexDetailsResponse {
  const AdminIndexDetailsResponse({required this.metadata});

  factory AdminIndexDetailsResponse.fromJson(Map<String, Object?> json) =>
      _$AdminIndexDetailsResponseFromJson(json);

  /// The index's metadata.
  final List<IndexInfo>? metadata;

  Map<String, Object?> toJson() => _$AdminIndexDetailsResponseToJson(this);
}
