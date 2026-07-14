// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'admin_application_method.dart';
import 'admin_campaign.dart';
import 'admin_promotion_rule.dart';
import 'admin_promotion_status.dart';
import 'admin_promotion_type.dart';

part 'admin_promotion.g.dart';

/// The promotion's details.
@JsonSerializable()
class AdminPromotion {
  const AdminPromotion({
    required this.id,
    required this.createdAt,
    required this.updatedAt,
    required this.deletedAt,
    this.applicationMethod,
    this.rules,
    this.code,
    this.type,
    this.isAutomatic,
    this.campaignId,
    this.campaign,
    this.status,
    this.isTaxInclusive,
    this.limit,
    this.used,
  });

  factory AdminPromotion.fromJson(Map<String, Object?> json) =>
      _$AdminPromotionFromJson(json);

  @JsonKey(name: 'application_method')
  final AdminApplicationMethod? applicationMethod;

  /// The promotion's rules.
  final List<AdminPromotionRule>? rules;

  /// The promotion's ID.
  final String id;

  /// The promotion's code.
  final String? code;

  /// The promotion's type.
  final AdminPromotionType? type;

  /// Whether the promotion is applied on a cart automatically if it matches the promotion's rules.
  @JsonKey(name: 'is_automatic')
  final bool? isAutomatic;

  /// The ID of the campaign this promotion belongs to.
  @JsonKey(name: 'campaign_id')
  final String? campaignId;
  final AdminCampaign? campaign;

  /// The date the promotion was created.
  @JsonKey(name: 'created_at')
  final DateTime createdAt;

  /// The date the promotion was updated.
  @JsonKey(name: 'updated_at')
  final DateTime updatedAt;

  /// The date the promotion was deleted.
  @JsonKey(name: 'deleted_at')
  final DateTime deletedAt;

  /// The promotion's status.
  final AdminPromotionStatus? status;

  /// Whether the promotion is tax inclusive. If enabled, the promotion is applied after tax is calculated.
  @JsonKey(name: 'is_tax_inclusive')
  final bool? isTaxInclusive;

  /// The limit of times the promotion can be used.
  final num? limit;

  /// The number of times the promotion has been used.
  final num? used;

  Map<String, Object?> toJson() => _$AdminPromotionToJson(this);
}
