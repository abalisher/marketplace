// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

part 'store_my_cart_res.g.dart';

@JsonSerializable()
class StoreMyCartRes {
  const StoreMyCartRes({required this.cartId});

  factory StoreMyCartRes.fromJson(Map<String, Object?> json) =>
      _$StoreMyCartResFromJson(json);

  /// Идентификатор незавершённой корзины покупателя; null — корзины нет.
  @JsonKey(name: 'cart_id')
  final String? cartId;

  Map<String, Object?> toJson() => _$StoreMyCartResToJson(this);
}
