// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'admin_claim.dart';
import 'admin_order_preview.dart';

part 'admin_claim_preview_response.g.dart';

/// The details of the claim, as well as a preview of the order when the claim is applied.
@JsonSerializable()
class AdminClaimPreviewResponse {
  const AdminClaimPreviewResponse({
    required this.orderPreview,
    required this.claim,
  });

  factory AdminClaimPreviewResponse.fromJson(Map<String, Object?> json) =>
      _$AdminClaimPreviewResponseFromJson(json);

  @JsonKey(name: 'order_preview')
  final AdminOrderPreview orderPreview;
  final AdminClaim claim;

  Map<String, Object?> toJson() => _$AdminClaimPreviewResponseToJson(this);
}
