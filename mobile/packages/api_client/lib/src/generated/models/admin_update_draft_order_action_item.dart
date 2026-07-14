// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

part 'admin_update_draft_order_action_item.g.dart';

/// The updates to make on a draft order's item.
@JsonSerializable()
class AdminUpdateDraftOrderActionItem {
  const AdminUpdateDraftOrderActionItem({
    required this.quantity,
    this.unitPrice,
    this.compareAtUnitPrice,
    this.internalNote,
  });

  factory AdminUpdateDraftOrderActionItem.fromJson(Map<String, Object?> json) =>
      _$AdminUpdateDraftOrderActionItemFromJson(json);

  /// The item's quantity.
  final num quantity;

  /// The item's unit price.
  @JsonKey(name: 'unit_price')
  final num? unitPrice;

  /// The original price of the item before a promotion or sale.
  @JsonKey(name: 'compare_at_unit_price')
  final num? compareAtUnitPrice;

  /// A note viewed only by admin users about the item.
  @JsonKey(name: 'internal_note')
  final String? internalNote;

  Map<String, Object?> toJson() =>
      _$AdminUpdateDraftOrderActionItemToJson(this);
}
