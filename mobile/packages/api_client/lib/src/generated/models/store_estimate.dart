// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'store_estimate_line.dart';
import 'store_estimate_source.dart';
import 'store_estimate_status.dart';

part 'store_estimate.g.dart';

@JsonSerializable()
class StoreEstimate {
  const StoreEstimate({
    required this.id,
    required this.source,
    required this.status,
    required this.lines,
    this.params,
    this.note,
    this.createdAt,
  });

  factory StoreEstimate.fromJson(Map<String, Object?> json) =>
      _$StoreEstimateFromJson(json);

  final String id;
  final StoreEstimateSource source;
  final StoreEstimateStatus status;
  final dynamic params;
  final String? note;
  @JsonKey(name: 'created_at')
  final DateTime? createdAt;
  final List<StoreEstimateLine> lines;

  Map<String, Object?> toJson() => _$StoreEstimateToJson(this);
}
