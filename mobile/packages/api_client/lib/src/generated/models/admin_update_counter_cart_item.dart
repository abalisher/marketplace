// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

part 'admin_update_counter_cart_item.g.dart';

@JsonSerializable()
class AdminUpdateCounterCartItem {
  const AdminUpdateCounterCartItem({required this.quantity});

  factory AdminUpdateCounterCartItem.fromJson(Map<String, Object?> json) =>
      _$AdminUpdateCounterCartItemFromJson(json);

  final int quantity;

  Map<String, Object?> toJson() => _$AdminUpdateCounterCartItemToJson(this);
}
