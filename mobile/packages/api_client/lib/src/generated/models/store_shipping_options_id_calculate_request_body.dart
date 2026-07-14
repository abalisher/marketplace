// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

part 'store_shipping_options_id_calculate_request_body.g.dart';

@JsonSerializable()
class StoreShippingOptionsIdCalculateRequestBody {
  const StoreShippingOptionsIdCalculateRequestBody({
    required this.cartId,
    this.data,
  });

  factory StoreShippingOptionsIdCalculateRequestBody.fromJson(
    Map<String, Object?> json,
  ) => _$StoreShippingOptionsIdCalculateRequestBodyFromJson(json);

  /// The ID of the cart the shipping option is used in.
  @JsonKey(name: 'cart_id')
  final String cartId;

  /// Custom data that's useful for the fulfillment provider to calculate the price.
  final dynamic data;

  Map<String, Object?> toJson() =>
      _$StoreShippingOptionsIdCalculateRequestBodyToJson(this);
}
