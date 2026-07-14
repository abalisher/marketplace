// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'items2.dart';

part 'admin_add_claim_outbound_items.g.dart';

/// The details of the outbound items to add to the claim.
@JsonSerializable()
class AdminAddClaimOutboundItems {
  const AdminAddClaimOutboundItems({this.items});

  factory AdminAddClaimOutboundItems.fromJson(Map<String, Object?> json) =>
      _$AdminAddClaimOutboundItemsFromJson(json);

  /// The outbound item's details.
  final List<Items2>? items;

  Map<String, Object?> toJson() => _$AdminAddClaimOutboundItemsToJson(this);
}
