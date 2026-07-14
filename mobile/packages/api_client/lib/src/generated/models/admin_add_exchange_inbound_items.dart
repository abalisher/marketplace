// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'items4.dart';

part 'admin_add_exchange_inbound_items.g.dart';

/// The details of the inbound (return) items.
@JsonSerializable()
class AdminAddExchangeInboundItems {
  const AdminAddExchangeInboundItems({this.items, this.locationId});

  factory AdminAddExchangeInboundItems.fromJson(Map<String, Object?> json) =>
      _$AdminAddExchangeInboundItemsFromJson(json);

  /// The details of the inbound (return) items.
  final List<Items4>? items;

  /// The ID of the location to which outbound items are sent from.
  @JsonKey(name: 'location_id')
  final String? locationId;

  Map<String, Object?> toJson() => _$AdminAddExchangeInboundItemsToJson(this);
}
