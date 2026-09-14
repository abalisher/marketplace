// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'admin_create_price_list_price.dart';
import 'admin_create_price_list_status.dart';
import 'admin_create_price_list_type.dart';

part 'admin_create_price_list.g.dart';

/// The price list's details.
@JsonSerializable()
class AdminCreatePriceList {
  const AdminCreatePriceList({
    required this.title,
    required this.description,
    this.startsAt,
    this.endsAt,
    this.status,
    this.type,
    this.rules,
    this.prices,
    this.metadata,
  });

  factory AdminCreatePriceList.fromJson(Map<String, Object?> json) =>
      _$AdminCreatePriceListFromJson(json);

  /// The price list's title.
  final String title;

  /// The price list's description.
  final String? description;

  /// The date and time the price list starts at.
  @JsonKey(name: 'starts_at')
  final DateTime? startsAt;

  /// The date and time the price list ends at.
  @JsonKey(name: 'ends_at')
  final DateTime? endsAt;

  /// The price list's status.
  final AdminCreatePriceListStatus? status;

  /// The price list's type.
  final AdminCreatePriceListType? type;

  /// The price list's rules.
  final dynamic rules;

  /// The price list's prices.
  final List<AdminCreatePriceListPrice>? prices;

  /// Key-value pairs of custom data.
  final dynamic metadata;

  Map<String, Object?> toJson() => _$AdminCreatePriceListToJson(this);
}
