// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'by_stage.dart';

part 'admin_shipping_queue_counts.g.dart';

@JsonSerializable()
class AdminShippingQueueCounts {
  const AdminShippingQueueCounts({required this.total, required this.byStage});

  factory AdminShippingQueueCounts.fromJson(Map<String, Object?> json) =>
      _$AdminShippingQueueCountsFromJson(json);

  final num total;
  @JsonKey(name: 'by_stage')
  final ByStage byStage;

  Map<String, Object?> toJson() => _$AdminShippingQueueCountsToJson(this);
}
