// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

part 'admin_deliver_order.g.dart';

@JsonSerializable()
class AdminDeliverOrder {
  const AdminDeliverOrder({required this.fulfillmentId, this.deliveryCode});

  factory AdminDeliverOrder.fromJson(Map<String, Object?> json) =>
      _$AdminDeliverOrderFromJson(json);

  @JsonKey(name: 'fulfillment_id')
  final String fulfillmentId;

  /// Код получения от покупателя — обязателен для заказов со способом delivery.
  @JsonKey(name: 'delivery_code')
  final String? deliveryCode;

  Map<String, Object?> toJson() => _$AdminDeliverOrderToJson(this);
}
