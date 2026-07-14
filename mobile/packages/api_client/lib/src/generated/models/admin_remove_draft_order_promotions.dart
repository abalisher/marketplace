// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

part 'admin_remove_draft_order_promotions.g.dart';

/// The promotion codes to remove from the draft order.
@JsonSerializable()
class AdminRemoveDraftOrderPromotions {
  const AdminRemoveDraftOrderPromotions({required this.promoCodes});

  factory AdminRemoveDraftOrderPromotions.fromJson(Map<String, Object?> json) =>
      _$AdminRemoveDraftOrderPromotionsFromJson(json);

  /// The promotion codes to remove from the draft order.
  @JsonKey(name: 'promo_codes')
  final List<String> promoCodes;

  Map<String, Object?> toJson() =>
      _$AdminRemoveDraftOrderPromotionsToJson(this);
}
