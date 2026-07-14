// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

part 'admin_post_returns_dismiss_items_action_req_schema.g.dart';

/// The details to update of the damaged item.
@JsonSerializable()
class AdminPostReturnsDismissItemsActionReqSchema {
  const AdminPostReturnsDismissItemsActionReqSchema({
    this.quantity,
    this.internalNote,
  });

  factory AdminPostReturnsDismissItemsActionReqSchema.fromJson(
    Map<String, Object?> json,
  ) => _$AdminPostReturnsDismissItemsActionReqSchemaFromJson(json);

  /// The item's quantity.
  final num? quantity;

  /// A note viewed only by admin users.
  @JsonKey(name: 'internal_note')
  final String? internalNote;

  Map<String, Object?> toJson() =>
      _$AdminPostReturnsDismissItemsActionReqSchemaToJson(this);
}
