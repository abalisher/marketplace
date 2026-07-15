// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'admin_order_line_input.dart';

part 'admin_ship_order.g.dart';

@JsonSerializable()
class AdminShipOrder {
  const AdminShipOrder({required this.fulfillmentId, required this.items});

  factory AdminShipOrder.fromJson(Map<String, Object?> json) =>
      _$AdminShipOrderFromJson(json);

  @JsonKey(name: 'fulfillment_id')
  final String fulfillmentId;
  final List<AdminOrderLineInput> items;

  Map<String, Object?> toJson() => _$AdminShipOrderToJson(this);
}
