// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

/// The applied action.
@JsonEnum()
enum OrderChangeActionAction {
  @JsonValue('CANCEL_RETURN_ITEM')
  cancelReturnItem('CANCEL_RETURN_ITEM'),
  @JsonValue('FULFILL_ITEM')
  fulfillItem('FULFILL_ITEM'),
  @JsonValue('DELIVER_ITEM')
  deliverItem('DELIVER_ITEM'),
  @JsonValue('CANCEL_ITEM_FULFILLMENT')
  cancelItemFulfillment('CANCEL_ITEM_FULFILLMENT'),
  @JsonValue('ITEM_ADD')
  itemAdd('ITEM_ADD'),
  @JsonValue('ITEM_REMOVE')
  itemRemove('ITEM_REMOVE'),
  @JsonValue('ITEM_UPDATE')
  itemUpdate('ITEM_UPDATE'),
  @JsonValue('RECEIVE_DAMAGED_RETURN_ITEM')
  receiveDamagedReturnItem('RECEIVE_DAMAGED_RETURN_ITEM'),
  @JsonValue('RECEIVE_RETURN_ITEM')
  receiveReturnItem('RECEIVE_RETURN_ITEM'),
  @JsonValue('RETURN_ITEM')
  returnItem('RETURN_ITEM'),
  @JsonValue('SHIPPING_ADD')
  shippingAdd('SHIPPING_ADD'),
  @JsonValue('SHIPPING_REMOVE')
  shippingRemove('SHIPPING_REMOVE'),
  @JsonValue('SHIP_ITEM')
  shipItem('SHIP_ITEM'),
  @JsonValue('WRITE_OFF_ITEM')
  writeOffItem('WRITE_OFF_ITEM'),
  @JsonValue('REINSTATE_ITEM')
  reinstateItem('REINSTATE_ITEM'),

  /// Default value for all unparsed values, allows backward compatibility when adding new values on the backend.
  $unknown(null);

  const OrderChangeActionAction(this.json);

  factory OrderChangeActionAction.fromJson(String json) =>
      values.firstWhere((e) => e.json == json, orElse: () => $unknown);

  final String? json;

  @override
  String toString() => json?.toString() ?? super.toString();

  /// Returns all defined enum values excluding the $unknown value.
  static List<OrderChangeActionAction> get $valuesDefined =>
      values.where((value) => value != $unknown).toList();
}
