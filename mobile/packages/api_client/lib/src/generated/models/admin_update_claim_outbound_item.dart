// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

part 'admin_update_claim_outbound_item.g.dart';

/// The details to update in the item.
@JsonSerializable()
class AdminUpdateClaimOutboundItem {
  const AdminUpdateClaimOutboundItem({
    this.quantity,
    this.reasonId,
    this.internalNote,
  });

  factory AdminUpdateClaimOutboundItem.fromJson(Map<String, Object?> json) =>
      _$AdminUpdateClaimOutboundItemFromJson(json);

  /// The item's quantity.
  final num? quantity;

  /// The ID of the return reason associated with the item.
  @JsonKey(name: 'reason_id')
  final String? reasonId;

  /// A note that's only viewed by admin users.
  @JsonKey(name: 'internal_note')
  final String? internalNote;

  Map<String, Object?> toJson() => _$AdminUpdateClaimOutboundItemToJson(this);
}
