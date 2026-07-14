// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'store_cart.dart';

part 'delete_store_carts_id_promotions_response.g.dart';

@JsonSerializable()
class DeleteStoreCartsIdPromotionsResponse {
  const DeleteStoreCartsIdPromotionsResponse({required this.cart});

  factory DeleteStoreCartsIdPromotionsResponse.fromJson(
    Map<String, Object?> json,
  ) => _$DeleteStoreCartsIdPromotionsResponseFromJson(json);

  final StoreCart cart;

  Map<String, Object?> toJson() =>
      _$DeleteStoreCartsIdPromotionsResponseToJson(this);
}
