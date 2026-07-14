// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'budget.dart';

part 'admin_campaign.g.dart';

/// The campaign's details.
@JsonSerializable()
class AdminCampaign {
  const AdminCampaign({
    required this.id,
    required this.name,
    required this.description,
    required this.currency,
    required this.campaignIdentifier,
    required this.startsAt,
    required this.endsAt,
    required this.budget,
    required this.createdAt,
    required this.updatedAt,
    required this.deletedAt,
  });

  factory AdminCampaign.fromJson(Map<String, Object?> json) =>
      _$AdminCampaignFromJson(json);

  /// The campaign's ID.
  final String id;

  /// The campaign's name.
  final String name;

  /// The campaign's description.
  final String description;

  /// The campaign's currency.
  final String currency;

  /// The campaign's identifier.
  @JsonKey(name: 'campaign_identifier')
  final String campaignIdentifier;

  /// The date and time that the campaign starts.
  @JsonKey(name: 'starts_at')
  final String startsAt;

  /// The date and time that the campaign ends.
  @JsonKey(name: 'ends_at')
  final String endsAt;

  /// The campaign's budget.
  final Budget budget;

  /// The date the campaign was created.
  @JsonKey(name: 'created_at')
  final DateTime createdAt;

  /// The date the campaign was updated.
  @JsonKey(name: 'updated_at')
  final DateTime updatedAt;

  /// The date the campaign was deleted.
  @JsonKey(name: 'deleted_at')
  final DateTime deletedAt;

  Map<String, Object?> toJson() => _$AdminCampaignToJson(this);
}
