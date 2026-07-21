// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'store_dispute.dart';

part 'store_dispute_res.g.dart';

@JsonSerializable()
class StoreDisputeRes {
  const StoreDisputeRes({required this.dispute});

  factory StoreDisputeRes.fromJson(Map<String, Object?> json) =>
      _$StoreDisputeResFromJson(json);

  final StoreDispute dispute;

  Map<String, Object?> toJson() => _$StoreDisputeResToJson(this);
}
