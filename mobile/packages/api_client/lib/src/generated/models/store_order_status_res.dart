// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

part 'store_order_status_res.g.dart';

@JsonSerializable()
class StoreOrderStatusRes {
  const StoreOrderStatusRes({required this.orderId, required this.status});

  factory StoreOrderStatusRes.fromJson(Map<String, Object?> json) =>
      _$StoreOrderStatusResFromJson(json);

  @JsonKey(name: 'order_id')
  final String orderId;
  final String status;

  Map<String, Object?> toJson() => _$StoreOrderStatusResToJson(this);
}
