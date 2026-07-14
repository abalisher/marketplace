// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

part 'admin_add_draft_order_promotions.g.dart';

/// The details of the promotions to add to a draft order.
@JsonSerializable()
class AdminAddDraftOrderPromotions {
  const AdminAddDraftOrderPromotions({required this.promoCodes});

  factory AdminAddDraftOrderPromotions.fromJson(Map<String, Object?> json) =>
      _$AdminAddDraftOrderPromotionsFromJson(json);

  /// The list promotion codes to add to the draft order.
  @JsonKey(name: 'promo_codes')
  final List<String> promoCodes;

  Map<String, Object?> toJson() => _$AdminAddDraftOrderPromotionsToJson(this);
}
