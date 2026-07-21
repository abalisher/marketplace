// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

part 'admin_add_counter_cart_item.g.dart';

@JsonSerializable()
class AdminAddCounterCartItem {
  const AdminAddCounterCartItem({
    required this.variantId,
    required this.quantity,
  });

  factory AdminAddCounterCartItem.fromJson(Map<String, Object?> json) =>
      _$AdminAddCounterCartItemFromJson(json);

  @JsonKey(name: 'variant_id')
  final String variantId;
  final int quantity;

  Map<String, Object?> toJson() => _$AdminAddCounterCartItemToJson(this);
}
