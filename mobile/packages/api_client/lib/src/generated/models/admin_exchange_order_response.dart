// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'admin_exchange.dart';
import 'order.dart';

part 'admin_exchange_order_response.g.dart';

/// The exchange's details.
@JsonSerializable()
class AdminExchangeOrderResponse {
  const AdminExchangeOrderResponse({
    required this.order,
    required this.exchange,
  });

  factory AdminExchangeOrderResponse.fromJson(Map<String, Object?> json) =>
      _$AdminExchangeOrderResponseFromJson(json);

  final Order order;
  final AdminExchange exchange;

  Map<String, Object?> toJson() => _$AdminExchangeOrderResponseToJson(this);
}
