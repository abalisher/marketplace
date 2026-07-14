// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'store_create_return_item.dart';
import 'store_create_return_shipping.dart';

part 'store_create_return.g.dart';

/// The details of the return to create.
@JsonSerializable()
class StoreCreateReturn {
  const StoreCreateReturn({
    required this.orderId,
    required this.items,
    required this.returnShipping,
    this.note,
    this.receiveNow,
    this.locationId,
  });

  factory StoreCreateReturn.fromJson(Map<String, Object?> json) =>
      _$StoreCreateReturnFromJson(json);

  /// The ID of the order this return is created for.
  @JsonKey(name: 'order_id')
  final String orderId;

  /// The return's items.
  final List<StoreCreateReturnItem> items;
  @JsonKey(name: 'return_shipping')
  final StoreCreateReturnShipping returnShipping;

  /// A note with more details about the return.
  final String? note;

  /// Whether to mark the return as received.
  @JsonKey(name: 'receive_now')
  final bool? receiveNow;

  /// The ID of the location that items are returned to.
  @JsonKey(name: 'location_id')
  final String? locationId;

  Map<String, Object?> toJson() => _$StoreCreateReturnToJson(this);
}
