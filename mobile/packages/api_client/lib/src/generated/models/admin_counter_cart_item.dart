// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

part 'admin_counter_cart_item.g.dart';

@JsonSerializable()
class AdminCounterCartItem {
  const AdminCounterCartItem({
    required this.id,
    required this.title,
    required this.quantity,
    required this.unitPrice,
    this.variantId,
    this.productId,
    this.productTitle,
    this.variantTitle,
    this.thumbnail,
  });

  factory AdminCounterCartItem.fromJson(Map<String, Object?> json) =>
      _$AdminCounterCartItemFromJson(json);

  final String id;
  @JsonKey(name: 'variant_id')
  final String? variantId;
  @JsonKey(name: 'product_id')
  final String? productId;
  final String title;
  @JsonKey(name: 'product_title')
  final String? productTitle;
  @JsonKey(name: 'variant_title')
  final String? variantTitle;
  final String? thumbnail;
  final int quantity;
  @JsonKey(name: 'unit_price')
  final num unitPrice;

  Map<String, Object?> toJson() => _$AdminCounterCartItemToJson(this);
}
