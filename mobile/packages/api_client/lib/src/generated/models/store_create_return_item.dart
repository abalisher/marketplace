// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

part 'store_create_return_item.g.dart';

/// The details of the line item to create.
@JsonSerializable()
class StoreCreateReturnItem {
  const StoreCreateReturnItem({
    required this.id,
    required this.quantity,
    this.reasonId,
    this.note,
  });

  factory StoreCreateReturnItem.fromJson(Map<String, Object?> json) =>
      _$StoreCreateReturnItemFromJson(json);

  /// The item's ID.
  final String id;

  /// The item's quantity.
  final num quantity;

  /// The ID of the associated return reason.
  @JsonKey(name: 'reason_id')
  final String? reasonId;

  /// A note with more details about the returned item.
  final String? note;

  Map<String, Object?> toJson() => _$StoreCreateReturnItemToJson(this);
}
