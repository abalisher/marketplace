// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'store_assistant_product_card_type.dart';

part 'store_assistant_product_card.g.dart';

@JsonSerializable()
class StoreAssistantProductCard {
  const StoreAssistantProductCard({
    required this.type,
    required this.variantId,
    required this.title,
    required this.price,
    required this.currency,
    required this.unit,
    required this.inStock,
    required this.imageUrl,
  });

  factory StoreAssistantProductCard.fromJson(Map<String, Object?> json) =>
      _$StoreAssistantProductCardFromJson(json);

  final StoreAssistantProductCardType type;
  @JsonKey(name: 'variant_id')
  final String variantId;
  final String title;

  /// Цена в основной единице валюты (1500 = 1 500 ₸), НЕ в минорных.
  final num price;
  final String currency;

  /// Единица измерения цены (мешок/тонна/м³/лист…).
  final String? unit;
  @JsonKey(name: 'in_stock')
  final bool inStock;
  @JsonKey(name: 'image_url')
  final String? imageUrl;

  Map<String, Object?> toJson() => _$StoreAssistantProductCardToJson(this);
}
