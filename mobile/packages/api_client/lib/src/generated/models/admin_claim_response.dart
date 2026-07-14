// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'admin_claim.dart';

part 'admin_claim_response.g.dart';

/// The claim's details.
@JsonSerializable()
class AdminClaimResponse {
  const AdminClaimResponse({required this.claim});

  factory AdminClaimResponse.fromJson(Map<String, Object?> json) =>
      _$AdminClaimResponseFromJson(json);

  final AdminClaim claim;

  Map<String, Object?> toJson() => _$AdminClaimResponseToJson(this);
}
