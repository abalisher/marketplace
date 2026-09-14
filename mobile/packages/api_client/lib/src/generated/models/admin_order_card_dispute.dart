// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

part 'admin_order_card_dispute.g.dart';

/// Активная претензия по заказу (модуль reviews).
@JsonSerializable()
class AdminOrderCardDispute {
  const AdminOrderCardDispute({
    required this.id,
    required this.category,
    required this.status,
    required this.description,
    this.createdAt,
  });

  factory AdminOrderCardDispute.fromJson(Map<String, Object?> json) =>
      _$AdminOrderCardDisputeFromJson(json);

  final String id;
  final String category;
  final String status;
  final String? description;
  @JsonKey(name: 'created_at')
  final DateTime? createdAt;

  Map<String, Object?> toJson() => _$AdminOrderCardDisputeToJson(this);
}
