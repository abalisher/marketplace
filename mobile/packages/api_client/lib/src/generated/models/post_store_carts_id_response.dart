// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'store_cart.dart';

part 'post_store_carts_id_response.g.dart';

@JsonSerializable()
class PostStoreCartsIdResponse {
  const PostStoreCartsIdResponse({required this.cart});

  factory PostStoreCartsIdResponse.fromJson(Map<String, Object?> json) =>
      _$PostStoreCartsIdResponseFromJson(json);

  final StoreCart cart;

  Map<String, Object?> toJson() => _$PostStoreCartsIdResponseToJson(this);
}
