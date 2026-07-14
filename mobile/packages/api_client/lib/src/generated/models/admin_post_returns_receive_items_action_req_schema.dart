// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

part 'admin_post_returns_receive_items_action_req_schema.g.dart';

/// The details of the received item.
@JsonSerializable()
class AdminPostReturnsReceiveItemsActionReqSchema {
  const AdminPostReturnsReceiveItemsActionReqSchema({
    this.quantity,
    this.internalNote,
  });

  factory AdminPostReturnsReceiveItemsActionReqSchema.fromJson(
    Map<String, Object?> json,
  ) => _$AdminPostReturnsReceiveItemsActionReqSchemaFromJson(json);

  /// The item's quantity.
  final num? quantity;

  /// A note viewed only by admin users.
  @JsonKey(name: 'internal_note')
  final String? internalNote;

  Map<String, Object?> toJson() =>
      _$AdminPostReturnsReceiveItemsActionReqSchemaToJson(this);
}
