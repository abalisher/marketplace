// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

part 'admin_post_order_edits_shipping_action_req_schema.g.dart';

/// The shipping method's details.
@JsonSerializable()
class AdminPostOrderEditsShippingActionReqSchema {
  const AdminPostOrderEditsShippingActionReqSchema({
    this.customAmount,
    this.internalNote,
    this.metadata,
  });

  factory AdminPostOrderEditsShippingActionReqSchema.fromJson(
    Map<String, Object?> json,
  ) => _$AdminPostOrderEditsShippingActionReqSchemaFromJson(json);

  /// Set a custom price for the shipping method.
  @JsonKey(name: 'custom_amount')
  final num? customAmount;

  /// A note viewed only by admin users.
  @JsonKey(name: 'internal_note')
  final String? internalNote;

  /// The order edit's metadata, can hold custom key-value pairs.
  final dynamic metadata;

  Map<String, Object?> toJson() =>
      _$AdminPostOrderEditsShippingActionReqSchemaToJson(this);
}
