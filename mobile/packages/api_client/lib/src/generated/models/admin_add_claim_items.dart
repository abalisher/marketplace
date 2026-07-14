// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'items.dart';

part 'admin_add_claim_items.g.dart';

/// The details of the order items to add to the claim.
@JsonSerializable()
class AdminAddClaimItems {
  const AdminAddClaimItems({this.items});

  factory AdminAddClaimItems.fromJson(Map<String, Object?> json) =>
      _$AdminAddClaimItemsFromJson(json);

  /// The item's details.
  final List<Items>? items;

  Map<String, Object?> toJson() => _$AdminAddClaimItemsToJson(this);
}
