// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'admin_register_dispute_category.dart';

part 'admin_register_dispute.g.dart';

/// Претензия, записанная оператором с чужих слов (звонок, выдача). Покупателя определяет заказ.
@JsonSerializable()
class AdminRegisterDispute {
  const AdminRegisterDispute({
    required this.orderId,
    required this.category,
    required this.description,
  });

  factory AdminRegisterDispute.fromJson(Map<String, Object?> json) =>
      _$AdminRegisterDisputeFromJson(json);

  @JsonKey(name: 'order_id')
  final String orderId;
  final AdminRegisterDisputeCategory category;
  final String? description;

  Map<String, Object?> toJson() => _$AdminRegisterDisputeToJson(this);
}
