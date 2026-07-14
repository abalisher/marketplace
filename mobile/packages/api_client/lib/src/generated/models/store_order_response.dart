// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'store_order.dart';

part 'store_order_response.g.dart';

/// The order's details.
@JsonSerializable()
class StoreOrderResponse {
  const StoreOrderResponse({required this.order});

  factory StoreOrderResponse.fromJson(Map<String, Object?> json) =>
      _$StoreOrderResponseFromJson(json);

  final StoreOrder order;

  Map<String, Object?> toJson() => _$StoreOrderResponseToJson(this);
}
