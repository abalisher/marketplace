// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

part 'admin_claim_add_outbound_shipping.g.dart';

/// The details of the shipping method used to ship outbound items.
@JsonSerializable()
class AdminClaimAddOutboundShipping {
  const AdminClaimAddOutboundShipping({
    required this.shippingOptionId,
    this.customAmount,
    this.description,
    this.internalNote,
    this.metadata,
  });

  factory AdminClaimAddOutboundShipping.fromJson(Map<String, Object?> json) =>
      _$AdminClaimAddOutboundShippingFromJson(json);

  /// The ID of the associated shipping option.
  @JsonKey(name: 'shipping_option_id')
  final String shippingOptionId;

  /// Set a custom price for the shipping method.
  @JsonKey(name: 'custom_amount')
  final num? customAmount;

  /// The shipping method's description.
  final String? description;

  /// A note only viewed by admin users.
  @JsonKey(name: 'internal_note')
  final String? internalNote;

  /// The claim's metadata, can hold custom key-value pairs.
  final dynamic metadata;

  Map<String, Object?> toJson() => _$AdminClaimAddOutboundShippingToJson(this);
}
