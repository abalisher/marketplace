// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'store_open_dispute_category.dart';

part 'store_open_dispute.g.dart';

@JsonSerializable()
class StoreOpenDispute {
  const StoreOpenDispute({required this.category, required this.description});

  factory StoreOpenDispute.fromJson(Map<String, Object?> json) =>
      _$StoreOpenDisputeFromJson(json);

  final StoreOpenDisputeCategory category;
  final String description;

  Map<String, Object?> toJson() => _$StoreOpenDisputeToJson(this);
}
