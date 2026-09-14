// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'admin_price_list_price.dart';
import 'admin_price_list_status.dart';
import 'admin_price_list_type.dart';

part 'admin_price_list.g.dart';

/// The price list's details.
@JsonSerializable()
class AdminPriceList {
  const AdminPriceList({
    required this.id,
    required this.title,
    required this.description,
    required this.rules,
    required this.startsAt,
    required this.endsAt,
    required this.status,
    required this.type,
    required this.prices,
    required this.createdAt,
    required this.updatedAt,
    required this.deletedAt,
    required this.metadata,
  });

  factory AdminPriceList.fromJson(Map<String, Object?> json) =>
      _$AdminPriceListFromJson(json);

  /// The price list's ID.
  final String id;

  /// The price list's title.
  final String title;

  /// The price list's description.
  final String? description;

  /// The price list's rules.
  final dynamic rules;

  /// The date the price list starts.
  @JsonKey(name: 'starts_at')
  final String startsAt;

  /// The date the price list ends.
  @JsonKey(name: 'ends_at')
  final String endsAt;

  /// The price list's status.
  final AdminPriceListStatus status;

  /// The price list's type.
  final AdminPriceListType type;

  /// The price list's prices.
  final List<AdminPriceListPrice> prices;

  /// The date the price list was created.
  @JsonKey(name: 'created_at')
  final DateTime createdAt;

  /// The date the price list was updated.
  @JsonKey(name: 'updated_at')
  final DateTime updatedAt;

  /// The date the price list was deleted.
  @JsonKey(name: 'deleted_at')
  final DateTime? deletedAt;

  /// Key-value pairs of custom data.
  final dynamic metadata;

  Map<String, Object?> toJson() => _$AdminPriceListToJson(this);
}
