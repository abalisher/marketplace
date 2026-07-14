// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'admin_order.dart';

part 'admin_order_response.g.dart';

/// An order's details.
@JsonSerializable()
class AdminOrderResponse {
  const AdminOrderResponse({required this.order});

  factory AdminOrderResponse.fromJson(Map<String, Object?> json) =>
      _$AdminOrderResponseFromJson(json);

  final AdminOrder order;

  Map<String, Object?> toJson() => _$AdminOrderResponseToJson(this);
}
