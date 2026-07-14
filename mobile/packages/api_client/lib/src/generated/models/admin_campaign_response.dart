// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'admin_campaign.dart';

part 'admin_campaign_response.g.dart';

/// The campaign's details.
@JsonSerializable()
class AdminCampaignResponse {
  const AdminCampaignResponse({required this.campaign});

  factory AdminCampaignResponse.fromJson(Map<String, Object?> json) =>
      _$AdminCampaignResponseFromJson(json);

  final AdminCampaign campaign;

  Map<String, Object?> toJson() => _$AdminCampaignResponseToJson(this);
}
