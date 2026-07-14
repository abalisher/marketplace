// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

part 'admin_post_order_edits_update_item_quantity_req_schema.g.dart';

/// The order item's details to update.
@JsonSerializable()
class AdminPostOrderEditsUpdateItemQuantityReqSchema {
  const AdminPostOrderEditsUpdateItemQuantityReqSchema({
    required this.quantity,
    this.internalNote,
    this.unitPrice,
    this.compareAtUnitPrice,
    this.metadata,
  });

  factory AdminPostOrderEditsUpdateItemQuantityReqSchema.fromJson(
    Map<String, Object?> json,
  ) => _$AdminPostOrderEditsUpdateItemQuantityReqSchemaFromJson(json);

  /// The item's quantity.
  final num quantity;

  /// A note viewed only by admin users.
  @JsonKey(name: 'internal_note')
  final String? internalNote;

  /// The item's unit price.
  @JsonKey(name: 'unit_price')
  final num? unitPrice;

  /// The original price of the item before a promotion or sale.
  @JsonKey(name: 'compare_at_unit_price')
  final num? compareAtUnitPrice;

  /// Key-value pairs of custom data.
  final dynamic metadata;

  Map<String, Object?> toJson() =>
      _$AdminPostOrderEditsUpdateItemQuantityReqSchemaToJson(this);
}
