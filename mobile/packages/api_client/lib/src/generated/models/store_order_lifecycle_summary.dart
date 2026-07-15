// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'store_order_lifecycle_summary_status.dart';

part 'store_order_lifecycle_summary.g.dart';

@JsonSerializable()
class StoreOrderLifecycleSummary {
  const StoreOrderLifecycleSummary({
    required this.id,
    required this.status,
    this.previousStatus,
    this.note,
  });

  factory StoreOrderLifecycleSummary.fromJson(Map<String, Object?> json) =>
      _$StoreOrderLifecycleSummaryFromJson(json);

  final String id;
  final StoreOrderLifecycleSummaryStatus status;
  @JsonKey(name: 'previous_status')
  final String? previousStatus;
  final String? note;

  Map<String, Object?> toJson() => _$StoreOrderLifecycleSummaryToJson(this);
}
