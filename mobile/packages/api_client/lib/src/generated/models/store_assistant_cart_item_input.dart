// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

part 'store_assistant_cart_item_input.g.dart';

@JsonSerializable()
class StoreAssistantCartItemInput {
  const StoreAssistantCartItemInput({
    required this.variantId,
    required this.quantity,
  });

  factory StoreAssistantCartItemInput.fromJson(Map<String, Object?> json) =>
      _$StoreAssistantCartItemInputFromJson(json);

  /// Идентификатор варианта товара (variant_id карточки подбора).
  @JsonKey(name: 'variant_id')
  final String variantId;

  /// Сколько единиц должно стать в корзине. 0 — убрать позицию.
  final int quantity;

  Map<String, Object?> toJson() => _$StoreAssistantCartItemInputToJson(this);
}
