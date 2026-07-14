// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

part 'admin_post_order_edits_shipping_req_schema.g.dart';

/// The shipping method's details.
@JsonSerializable()
class AdminPostOrderEditsShippingReqSchema {
  const AdminPostOrderEditsShippingReqSchema({
    required this.shippingOptionId,
    this.customAmount,
    this.description,
    this.internalNote,
    this.metadata,
  });

  factory AdminPostOrderEditsShippingReqSchema.fromJson(
    Map<String, Object?> json,
  ) => _$AdminPostOrderEditsShippingReqSchemaFromJson(json);

  /// The ID of the associated shipping option.
  @JsonKey(name: 'shipping_option_id')
  final String shippingOptionId;

  /// Set a custom price for the shipping method.
  @JsonKey(name: 'custom_amount')
  final num? customAmount;

  /// The shipping method's description.
  final String? description;

  /// A note viewed only by admin users.
  @JsonKey(name: 'internal_note')
  final String? internalNote;

  /// The shipping method's metadata, can hold custom key-value pairs.
  final dynamic metadata;

  Map<String, Object?> toJson() =>
      _$AdminPostOrderEditsShippingReqSchemaToJson(this);
}
