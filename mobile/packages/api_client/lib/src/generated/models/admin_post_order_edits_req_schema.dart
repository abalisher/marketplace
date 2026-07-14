// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

part 'admin_post_order_edits_req_schema.g.dart';

/// The order edit's details.
@JsonSerializable()
class AdminPostOrderEditsReqSchema {
  const AdminPostOrderEditsReqSchema({
    required this.orderId,
    this.description,
    this.internalNote,
    this.metadata,
  });

  factory AdminPostOrderEditsReqSchema.fromJson(Map<String, Object?> json) =>
      _$AdminPostOrderEditsReqSchemaFromJson(json);

  /// The ID of the order this edit is for.
  @JsonKey(name: 'order_id')
  final String orderId;

  /// The order edit's description.
  final String? description;

  /// A note viewed only by admin users.
  @JsonKey(name: 'internal_note')
  final String? internalNote;

  /// The order edit's metadata, can hold custom key-value pairs.
  final dynamic metadata;

  Map<String, Object?> toJson() => _$AdminPostOrderEditsReqSchemaToJson(this);
}
