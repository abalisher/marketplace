// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'admin_claim.dart';
import 'admin_order_preview.dart';
import 'admin_return.dart';

part 'admin_claim_request_response.g.dart';

/// The details of the claim, its return, and a preview of the order when the claim is applied.
@JsonSerializable()
class AdminClaimRequestResponse {
  const AdminClaimRequestResponse({
    required this.returnValue,
    required this.orderPreview,
    required this.claim,
  });

  factory AdminClaimRequestResponse.fromJson(Map<String, Object?> json) =>
      _$AdminClaimRequestResponseFromJson(json);

  /// The name has been replaced because it contains a keyword. Original name: `return`.
  @JsonKey(name: 'return')
  final AdminReturn returnValue;
  @JsonKey(name: 'order_preview')
  final AdminOrderPreview orderPreview;
  final AdminClaim claim;

  Map<String, Object?> toJson() => _$AdminClaimRequestResponseToJson(this);
}
