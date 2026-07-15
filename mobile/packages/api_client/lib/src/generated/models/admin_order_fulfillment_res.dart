// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'fulfillment.dart';

part 'admin_order_fulfillment_res.g.dart';

@JsonSerializable()
class AdminOrderFulfillmentRes {
  const AdminOrderFulfillmentRes({required this.orderId, this.fulfillment});

  factory AdminOrderFulfillmentRes.fromJson(Map<String, Object?> json) =>
      _$AdminOrderFulfillmentResFromJson(json);

  @JsonKey(name: 'order_id')
  final String orderId;

  /// Созданный fulfillment ядра.
  final Fulfillment? fulfillment;

  Map<String, Object?> toJson() => _$AdminOrderFulfillmentResToJson(this);
}
