// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'budget2.dart';

part 'campaign_response.g.dart';

/// The campaign's details.
@JsonSerializable()
class CampaignResponse {
  const CampaignResponse({
    required this.id,
    required this.name,
    required this.description,
    required this.currency,
    required this.campaignIdentifier,
    required this.startsAt,
    required this.endsAt,
    required this.budget,
  });

  factory CampaignResponse.fromJson(Map<String, Object?> json) =>
      _$CampaignResponseFromJson(json);

  /// The campaign's ID.
  final String id;

  /// The campaign's name.
  final String name;

  /// The campaign's description.
  final String? description;

  /// The campaign's currency.
  final String currency;

  /// The campaign's campaign identifier.
  @JsonKey(name: 'campaign_identifier')
  final String campaignIdentifier;

  /// The campaign's starts at.
  @JsonKey(name: 'starts_at')
  final String startsAt;

  /// The campaign's ends at.
  @JsonKey(name: 'ends_at')
  final String endsAt;

  /// The campaign's budget.
  final Budget2 budget;

  Map<String, Object?> toJson() => _$CampaignResponseToJson(this);
}
