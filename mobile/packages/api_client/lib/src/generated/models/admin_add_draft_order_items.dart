// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'items3.dart';

part 'admin_add_draft_order_items.g.dart';

/// The details of the items to add to a draft order.
@JsonSerializable()
class AdminAddDraftOrderItems {
  const AdminAddDraftOrderItems({this.items});

  factory AdminAddDraftOrderItems.fromJson(Map<String, Object?> json) =>
      _$AdminAddDraftOrderItemsFromJson(json);

  /// The items to add to the draft order.
  final List<Items3>? items;

  Map<String, Object?> toJson() => _$AdminAddDraftOrderItemsToJson(this);
}
