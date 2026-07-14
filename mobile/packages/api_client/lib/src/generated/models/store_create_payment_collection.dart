// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

part 'store_create_payment_collection.g.dart';

/// The details of the payment collection to create.
@JsonSerializable()
class StoreCreatePaymentCollection {
  const StoreCreatePaymentCollection({required this.cartId});

  factory StoreCreatePaymentCollection.fromJson(Map<String, Object?> json) =>
      _$StoreCreatePaymentCollectionFromJson(json);

  /// The ID of the cart this payment collection is for.
  @JsonKey(name: 'cart_id')
  final String cartId;

  Map<String, Object?> toJson() => _$StoreCreatePaymentCollectionToJson(this);
}
