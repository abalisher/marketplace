// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'admin_dispute.dart';

part 'admin_dispute_res.g.dart';

@JsonSerializable()
class AdminDisputeRes {
  const AdminDisputeRes({required this.dispute});

  factory AdminDisputeRes.fromJson(Map<String, Object?> json) =>
      _$AdminDisputeResFromJson(json);

  final AdminDispute dispute;

  Map<String, Object?> toJson() => _$AdminDisputeResToJson(this);
}
