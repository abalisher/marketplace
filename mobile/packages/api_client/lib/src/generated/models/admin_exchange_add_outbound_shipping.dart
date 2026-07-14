// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

part 'admin_exchange_add_outbound_shipping.g.dart';

/// The outbound shipping method's details.
@JsonSerializable()
class AdminExchangeAddOutboundShipping {
  const AdminExchangeAddOutboundShipping({
    required this.shippingOptionId,
    this.customAmount,
    this.description,
    this.internalNote,
    this.metadata,
  });

  factory AdminExchangeAddOutboundShipping.fromJson(
    Map<String, Object?> json,
  ) => _$AdminExchangeAddOutboundShippingFromJson(json);

  /// The ID of the associated shipping option.
  @JsonKey(name: 'shipping_option_id')
  final String shippingOptionId;

  /// Set a custom amount for the shipping method.
  @JsonKey(name: 'custom_amount')
  final num? customAmount;

  /// The shipping method's description.
  final String? description;

  /// A note viewed by admin users only.
  @JsonKey(name: 'internal_note')
  final String? internalNote;

  /// The exchange's metadata, can hold custom key-value pairs.
  final dynamic metadata;

  Map<String, Object?> toJson() =>
      _$AdminExchangeAddOutboundShippingToJson(this);
}
