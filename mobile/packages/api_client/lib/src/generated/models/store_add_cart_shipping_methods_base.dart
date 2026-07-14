// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

part 'store_add_cart_shipping_methods_base.g.dart';

/// The shipping method's details.
@JsonSerializable()
class StoreAddCartShippingMethodsBase {
  const StoreAddCartShippingMethodsBase({required this.optionId, this.data});

  factory StoreAddCartShippingMethodsBase.fromJson(Map<String, Object?> json) =>
      _$StoreAddCartShippingMethodsBaseFromJson(json);

  /// The ID of the shipping option to add to the cart.
  @JsonKey(name: 'option_id')
  final String optionId;

  /// Any additional data relevant for the third-party fulfillment provider to process the shipment.
  final dynamic data;

  Map<String, Object?> toJson() =>
      _$StoreAddCartShippingMethodsBaseToJson(this);
}
