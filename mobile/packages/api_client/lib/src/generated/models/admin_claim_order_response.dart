// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'admin_claim.dart';
import 'order.dart';

part 'admin_claim_order_response.g.dart';

/// The created claim's details.
@JsonSerializable()
class AdminClaimOrderResponse {
  const AdminClaimOrderResponse({required this.order, required this.claim});

  factory AdminClaimOrderResponse.fromJson(Map<String, Object?> json) =>
      _$AdminClaimOrderResponseFromJson(json);

  final Order order;
  final AdminClaim claim;

  Map<String, Object?> toJson() => _$AdminClaimOrderResponseToJson(this);
}
