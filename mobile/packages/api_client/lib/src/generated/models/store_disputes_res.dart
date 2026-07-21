// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'store_dispute.dart';

part 'store_disputes_res.g.dart';

@JsonSerializable()
class StoreDisputesRes {
  const StoreDisputesRes({required this.disputes});

  factory StoreDisputesRes.fromJson(Map<String, Object?> json) =>
      _$StoreDisputesResFromJson(json);

  final List<StoreDispute> disputes;

  Map<String, Object?> toJson() => _$StoreDisputesResToJson(this);
}
