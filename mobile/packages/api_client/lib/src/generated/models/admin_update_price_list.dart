// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'admin_update_price_list_status.dart';
import 'admin_update_price_list_type.dart';

part 'admin_update_price_list.g.dart';

/// the details to update in a price list.
@JsonSerializable()
class AdminUpdatePriceList {
  const AdminUpdatePriceList({
    this.title,
    this.description,
    this.startsAt,
    this.endsAt,
    this.status,
    this.type,
    this.rules,
    this.metadata,
  });

  factory AdminUpdatePriceList.fromJson(Map<String, Object?> json) =>
      _$AdminUpdatePriceListFromJson(json);

  /// The price list's title.
  final String? title;

  /// The price list's description.
  final String? description;

  /// The date the price list starts.
  @JsonKey(name: 'starts_at')
  final String? startsAt;

  /// The date the price list ends.
  @JsonKey(name: 'ends_at')
  final String? endsAt;

  /// The price list's status.
  final AdminUpdatePriceListStatus? status;

  /// The price list's type.
  final AdminUpdatePriceListType? type;

  /// The price list's rules.
  final dynamic rules;

  /// Key-value pairs of custom data.
  final dynamic metadata;

  Map<String, Object?> toJson() => _$AdminUpdatePriceListToJson(this);
}
