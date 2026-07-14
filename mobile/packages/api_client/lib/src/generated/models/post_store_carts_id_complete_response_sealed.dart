// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'error.dart';
import 'store_cart.dart';
import 'store_order.dart';

part 'post_store_carts_id_complete_response_sealed.g.dart';

@JsonSerializable(createFactory: false)
sealed class PostStoreCartsIdCompleteResponseSealed {
  const PostStoreCartsIdCompleteResponseSealed();

  factory PostStoreCartsIdCompleteResponseSealed.fromJson(
    Map<String, dynamic> json,
  ) => PostStoreCartsIdCompleteResponseSealedDeserializer.tryDeserialize(json);

  Map<String, dynamic> toJson();
}

extension PostStoreCartsIdCompleteResponseSealedDeserializer
    on PostStoreCartsIdCompleteResponseSealed {
  static PostStoreCartsIdCompleteResponseSealed tryDeserialize(
    Map<String, dynamic> json,
  ) {
    try {
      return PostStoreCartsIdCompleteResponseSealedVariant1.fromJson(json);
    } catch (_) {}
    try {
      return PostStoreCartsIdCompleteResponseSealedVariant2.fromJson(json);
    } catch (_) {}

    throw FormatException(
      'Could not determine the correct type for PostStoreCartsIdCompleteResponseSealed from: $json',
    );
  }
}

@JsonSerializable()
class PostStoreCartsIdCompleteResponseSealedVariant1
    extends PostStoreCartsIdCompleteResponseSealed {
  @override
  final String type;
  @override
  final StoreOrder order;

  const PostStoreCartsIdCompleteResponseSealedVariant1({
    required this.type,
    required this.order,
  });

  factory PostStoreCartsIdCompleteResponseSealedVariant1.fromJson(
    Map<String, dynamic> json,
  ) => _$PostStoreCartsIdCompleteResponseSealedVariant1FromJson(json);

  @override
  Map<String, dynamic> toJson() =>
      _$PostStoreCartsIdCompleteResponseSealedVariant1ToJson(this);
}

@JsonSerializable()
class PostStoreCartsIdCompleteResponseSealedVariant2
    extends PostStoreCartsIdCompleteResponseSealed {
  @override
  final String type;
  @override
  final StoreCart cart;
  @override
  final Error error;

  const PostStoreCartsIdCompleteResponseSealedVariant2({
    required this.type,
    required this.cart,
    required this.error,
  });

  factory PostStoreCartsIdCompleteResponseSealedVariant2.fromJson(
    Map<String, dynamic> json,
  ) => _$PostStoreCartsIdCompleteResponseSealedVariant2FromJson(json);

  @override
  Map<String, dynamic> toJson() =>
      _$PostStoreCartsIdCompleteResponseSealedVariant2ToJson(this);
}
