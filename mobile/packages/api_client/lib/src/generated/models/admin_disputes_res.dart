// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'admin_dispute.dart';

part 'admin_disputes_res.g.dart';

@JsonSerializable()
class AdminDisputesRes {
  const AdminDisputesRes({required this.disputes});

  factory AdminDisputesRes.fromJson(Map<String, Object?> json) =>
      _$AdminDisputesResFromJson(json);

  final List<AdminDispute> disputes;

  Map<String, Object?> toJson() => _$AdminDisputesResToJson(this);
}
