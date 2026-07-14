// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'store_cart.dart';

part 'delete_store_carts_id_line_items_line_id_response.g.dart';

/// The deletion's details.
@JsonSerializable()
class DeleteStoreCartsIdLineItemsLineIdResponse {
  const DeleteStoreCartsIdLineItemsLineIdResponse({
    required this.id,
    required this.deleted,
    this.parent,
    this.object = 'line-item',
  });

  factory DeleteStoreCartsIdLineItemsLineIdResponse.fromJson(
    Map<String, Object?> json,
  ) => _$DeleteStoreCartsIdLineItemsLineIdResponseFromJson(json);

  /// The ID of the deleted line item.
  final String id;

  /// The name of the deleted object.
  final String object;

  /// Whether the item was deleted.
  final bool deleted;

  /// The cart that the item belonged to.
  final StoreCart? parent;

  Map<String, Object?> toJson() =>
      _$DeleteStoreCartsIdLineItemsLineIdResponseToJson(this);
}
