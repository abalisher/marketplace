// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'store_order_lifecycle_summary.dart';
import 'store_placed_order_ref.dart';

part 'store_place_order_res.g.dart';

@JsonSerializable()
class StorePlaceOrderRes {
  const StorePlaceOrderRes({required this.order, required this.lifecycle});

  factory StorePlaceOrderRes.fromJson(Map<String, Object?> json) =>
      _$StorePlaceOrderResFromJson(json);

  final StorePlacedOrderRef order;
  final StoreOrderLifecycleSummary lifecycle;

  Map<String, Object?> toJson() => _$StorePlaceOrderResToJson(this);
}
