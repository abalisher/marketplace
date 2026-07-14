// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'store_cart_shipping_option.dart';

part 'store_shipping_option_response.g.dart';

/// The shipping option's details.
@JsonSerializable()
class StoreShippingOptionResponse {
  const StoreShippingOptionResponse({required this.shippingOption});

  factory StoreShippingOptionResponse.fromJson(Map<String, Object?> json) =>
      _$StoreShippingOptionResponseFromJson(json);

  @JsonKey(name: 'shipping_option')
  final StoreCartShippingOption shippingOption;

  Map<String, Object?> toJson() => _$StoreShippingOptionResponseToJson(this);
}
