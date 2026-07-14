// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

part 'admin_update_exchange_outbound_item.g.dart';

/// The details to update in an outbound item.
@JsonSerializable()
class AdminUpdateExchangeOutboundItem {
  const AdminUpdateExchangeOutboundItem({this.quantity, this.internalNote});

  factory AdminUpdateExchangeOutboundItem.fromJson(Map<String, Object?> json) =>
      _$AdminUpdateExchangeOutboundItemFromJson(json);

  /// The item's quantity.
  final num? quantity;

  /// A note only viewed by admin users.
  @JsonKey(name: 'internal_note')
  final String? internalNote;

  Map<String, Object?> toJson() =>
      _$AdminUpdateExchangeOutboundItemToJson(this);
}
