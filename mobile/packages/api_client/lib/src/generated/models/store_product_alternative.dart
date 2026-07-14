// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'store_product_card_summary.dart';

part 'store_product_alternative.g.dart';

@JsonSerializable()
class StoreProductAlternative {
  const StoreProductAlternative({
    required this.id,
    required this.title,
    this.handle,
    this.thumbnail,
    this.productCard,
  });

  factory StoreProductAlternative.fromJson(Map<String, Object?> json) =>
      _$StoreProductAlternativeFromJson(json);

  final String id;
  final String title;
  final String? handle;
  final String? thumbnail;
  @JsonKey(name: 'product_card')
  final StoreProductCardSummary? productCard;

  Map<String, Object?> toJson() => _$StoreProductAlternativeToJson(this);
}
