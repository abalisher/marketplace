// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'items5.dart';

part 'admin_add_exchange_outbound_items.g.dart';

/// The details of outbound items.
@JsonSerializable()
class AdminAddExchangeOutboundItems {
  const AdminAddExchangeOutboundItems({this.items});

  factory AdminAddExchangeOutboundItems.fromJson(Map<String, Object?> json) =>
      _$AdminAddExchangeOutboundItemsFromJson(json);

  /// The details of outbound items.
  final List<Items5>? items;

  Map<String, Object?> toJson() => _$AdminAddExchangeOutboundItemsToJson(this);
}
