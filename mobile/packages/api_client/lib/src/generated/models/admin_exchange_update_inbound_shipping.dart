// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

part 'admin_exchange_update_inbound_shipping.g.dart';

/// The details of the shipping method to update.
@JsonSerializable()
class AdminExchangeUpdateInboundShipping {
  const AdminExchangeUpdateInboundShipping({
    this.customAmount,
    this.internalNote,
    this.metadata,
  });

  factory AdminExchangeUpdateInboundShipping.fromJson(
    Map<String, Object?> json,
  ) => _$AdminExchangeUpdateInboundShippingFromJson(json);

  /// The shipping method's custom amount.
  @JsonKey(name: 'custom_amount')
  final num? customAmount;

  /// A note viewed by admin users only.
  @JsonKey(name: 'internal_note')
  final String? internalNote;

  /// The exchange's metadata, can hold custom key-value pairs.
  final dynamic metadata;

  Map<String, Object?> toJson() =>
      _$AdminExchangeUpdateInboundShippingToJson(this);
}
