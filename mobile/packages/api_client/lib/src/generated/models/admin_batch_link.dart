// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

part 'admin_batch_link.g.dart';

/// A batch operation to manage the associations between two entities.
@JsonSerializable()
class AdminBatchLink {
  const AdminBatchLink({this.add, this.remove});

  factory AdminBatchLink.fromJson(Map<String, Object?> json) =>
      _$AdminBatchLinkFromJson(json);

  /// The IDs of an entity to add to the other.
  final List<String>? add;

  /// The IDs of an entity to remove from the other.
  final List<String>? remove;

  Map<String, Object?> toJson() => _$AdminBatchLinkToJson(this);
}
