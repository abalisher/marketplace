// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

part 'store_placed_order_ref.g.dart';

/// Заказ ядра (schema StoreOrder базовой спеки).
@JsonSerializable()
class StorePlacedOrderRef {
  const StorePlacedOrderRef({this.id});

  factory StorePlacedOrderRef.fromJson(Map<String, Object?> json) =>
      _$StorePlacedOrderRefFromJson(json);

  final String? id;

  Map<String, Object?> toJson() => _$StorePlacedOrderRefToJson(this);
}
