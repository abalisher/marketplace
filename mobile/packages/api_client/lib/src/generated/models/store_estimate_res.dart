// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'store_estimate.dart';

part 'store_estimate_res.g.dart';

@JsonSerializable()
class StoreEstimateRes {
  const StoreEstimateRes({required this.estimate});

  factory StoreEstimateRes.fromJson(Map<String, Object?> json) =>
      _$StoreEstimateResFromJson(json);

  final StoreEstimate estimate;

  Map<String, Object?> toJson() => _$StoreEstimateResToJson(this);
}
