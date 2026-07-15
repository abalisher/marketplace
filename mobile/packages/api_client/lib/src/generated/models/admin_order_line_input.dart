// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

part 'admin_order_line_input.g.dart';

@JsonSerializable()
class AdminOrderLineInput {
  const AdminOrderLineInput({required this.id, required this.quantity});

  factory AdminOrderLineInput.fromJson(Map<String, Object?> json) =>
      _$AdminOrderLineInputFromJson(json);

  /// Id позиции заказа (order line item).
  final String id;
  final int quantity;

  Map<String, Object?> toJson() => _$AdminOrderLineInputToJson(this);
}
