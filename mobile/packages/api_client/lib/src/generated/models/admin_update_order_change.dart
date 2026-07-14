// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

part 'admin_update_order_change.g.dart';

/// The data to update in the order change.
@JsonSerializable()
class AdminUpdateOrderChange {
  const AdminUpdateOrderChange({this.carryOverPromotions, this.internalNote});

  factory AdminUpdateOrderChange.fromJson(Map<String, Object?> json) =>
      _$AdminUpdateOrderChangeFromJson(json);

  /// Whether promotions from the original order should be carried over to the order change (specifically, exchanges).
  @JsonKey(name: 'carry_over_promotions')
  final bool? carryOverPromotions;

  /// The order change's internal note.
  @JsonKey(name: 'internal_note')
  final String? internalNote;

  Map<String, Object?> toJson() => _$AdminUpdateOrderChangeToJson(this);
}
