// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'admin_dispute_history_entry.dart';

part 'admin_dispute_customer_history.g.dart';

/// История обращений покупателя: часто ли жалуется и чем закончились прошлые.
@JsonSerializable()
class AdminDisputeCustomerHistory {
  const AdminDisputeCustomerHistory({
    required this.orderCount,
    required this.disputeCount,
    required this.resolvedCount,
    required this.rejectedCount,
    required this.others,
  });

  factory AdminDisputeCustomerHistory.fromJson(Map<String, Object?> json) =>
      _$AdminDisputeCustomerHistoryFromJson(json);

  @JsonKey(name: 'order_count')
  final int orderCount;
  @JsonKey(name: 'dispute_count')
  final int disputeCount;
  @JsonKey(name: 'resolved_count')
  final int resolvedCount;
  @JsonKey(name: 'rejected_count')
  final int rejectedCount;
  final List<AdminDisputeHistoryEntry> others;

  Map<String, Object?> toJson() => _$AdminDisputeCustomerHistoryToJson(this);
}
