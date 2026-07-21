// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'admin_transition_dispute_to.dart';

part 'admin_transition_dispute.g.dart';

@JsonSerializable()
class AdminTransitionDispute {
  const AdminTransitionDispute({required this.to, this.resolution});

  factory AdminTransitionDispute.fromJson(Map<String, Object?> json) =>
      _$AdminTransitionDisputeFromJson(json);

  final AdminTransitionDisputeTo to;
  final String? resolution;

  Map<String, Object?> toJson() => _$AdminTransitionDisputeToJson(this);
}
