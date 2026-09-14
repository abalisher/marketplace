// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'admin_dispute_customer_history.dart';
import 'admin_dispute_row.dart';
import 'admin_order_card.dart';
import 'admin_review.dart';

part 'admin_dispute_card.g.dart';

/// Рабочее место претензии: претензия со сроком, заказ целиком, отзывы заказа и история обращений покупателя.
@JsonSerializable()
class AdminDisputeCard {
  const AdminDisputeCard({
    required this.dispute,
    required this.slaHours,
    required this.reviews,
    required this.customerHistory,
    this.order,
  });

  factory AdminDisputeCard.fromJson(Map<String, Object?> json) =>
      _$AdminDisputeCardFromJson(json);

  final AdminDisputeRow dispute;
  @JsonKey(name: 'sla_hours')
  final int slaHours;

  /// Заказ претензии; null — заказ недоступен.
  final AdminOrderCard? order;
  final List<AdminReview> reviews;
  @JsonKey(name: 'customer_history')
  final AdminDisputeCustomerHistory customerHistory;

  Map<String, Object?> toJson() => _$AdminDisputeCardToJson(this);
}
