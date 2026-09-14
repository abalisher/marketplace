// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

part 'admin_order_card_item.g.dart';

@JsonSerializable()
class AdminOrderCardItem {
  const AdminOrderCardItem({
    required this.id,
    required this.title,
    required this.quantity,
    this.variantTitle,
    this.unitPrice,
    this.total,
  });

  factory AdminOrderCardItem.fromJson(Map<String, Object?> json) =>
      _$AdminOrderCardItemFromJson(json);

  final String id;
  final String title;
  @JsonKey(name: 'variant_title')
  final String? variantTitle;
  final num quantity;
  @JsonKey(name: 'unit_price')
  final num? unitPrice;
  final num? total;

  Map<String, Object?> toJson() => _$AdminOrderCardItemToJson(this);
}
