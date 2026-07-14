// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'store_cart.dart';

part 'store_cart_response.g.dart';

/// The cart's details.
@JsonSerializable()
class StoreCartResponse {
  const StoreCartResponse({required this.cart});

  factory StoreCartResponse.fromJson(Map<String, Object?> json) =>
      _$StoreCartResponseFromJson(json);

  final StoreCart cart;

  Map<String, Object?> toJson() => _$StoreCartResponseToJson(this);
}
