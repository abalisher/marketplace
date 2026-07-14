// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

part 'admin_post_order_edits_items_action_req_schema.g.dart';

/// The details to update in the item.
@JsonSerializable()
class AdminPostOrderEditsItemsActionReqSchema {
  const AdminPostOrderEditsItemsActionReqSchema({
    this.quantity,
    this.internalNote,
    this.unitPrice,
    this.compareAtUnitPrice,
  });

  factory AdminPostOrderEditsItemsActionReqSchema.fromJson(
    Map<String, Object?> json,
  ) => _$AdminPostOrderEditsItemsActionReqSchemaFromJson(json);

  /// The item's quantity.
  final num? quantity;

  /// A note viewed only by admin users.
  @JsonKey(name: 'internal_note')
  final String? internalNote;

  /// The item's unit price.
  @JsonKey(name: 'unit_price')
  final num? unitPrice;

  /// The original price of the item before a promotion or sale.
  @JsonKey(name: 'compare_at_unit_price')
  final num? compareAtUnitPrice;

  Map<String, Object?> toJson() =>
      _$AdminPostOrderEditsItemsActionReqSchemaToJson(this);
}
