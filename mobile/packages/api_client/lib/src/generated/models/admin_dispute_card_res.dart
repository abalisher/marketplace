// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'admin_dispute_card.dart';

part 'admin_dispute_card_res.g.dart';

@JsonSerializable()
class AdminDisputeCardRes {
  const AdminDisputeCardRes({required this.disputeCard});

  factory AdminDisputeCardRes.fromJson(Map<String, Object?> json) =>
      _$AdminDisputeCardResFromJson(json);

  @JsonKey(name: 'dispute_card')
  final AdminDisputeCard disputeCard;

  Map<String, Object?> toJson() => _$AdminDisputeCardResToJson(this);
}
