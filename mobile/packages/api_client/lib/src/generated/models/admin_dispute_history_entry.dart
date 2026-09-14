// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

part 'admin_dispute_history_entry.g.dart';

@JsonSerializable()
class AdminDisputeHistoryEntry {
  const AdminDisputeHistoryEntry({
    required this.id,
    required this.orderId,
    required this.category,
    required this.status,
    this.orderDisplayId,
    this.outcome,
    this.createdAt,
  });

  factory AdminDisputeHistoryEntry.fromJson(Map<String, Object?> json) =>
      _$AdminDisputeHistoryEntryFromJson(json);

  final String id;
  @JsonKey(name: 'order_id')
  final String orderId;
  @JsonKey(name: 'order_display_id')
  final int? orderDisplayId;
  final String category;
  final String status;
  final String? outcome;
  @JsonKey(name: 'created_at')
  final DateTime? createdAt;

  Map<String, Object?> toJson() => _$AdminDisputeHistoryEntryToJson(this);
}
