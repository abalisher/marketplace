// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

part 'admin_claim_update_inbound_shipping.g.dart';

/// The details to update in the shipping method.
@JsonSerializable()
class AdminClaimUpdateInboundShipping {
  const AdminClaimUpdateInboundShipping({
    this.customAmount,
    this.internalNote,
    this.metadata,
  });

  factory AdminClaimUpdateInboundShipping.fromJson(Map<String, Object?> json) =>
      _$AdminClaimUpdateInboundShippingFromJson(json);

  /// The shipping method's custom amount.
  @JsonKey(name: 'custom_amount')
  final num? customAmount;

  /// A note only viewed by admin users.
  @JsonKey(name: 'internal_note')
  final String? internalNote;

  /// The claim's metadata, can hold custom key-value pairs.
  final dynamic metadata;

  Map<String, Object?> toJson() =>
      _$AdminClaimUpdateInboundShippingToJson(this);
}
