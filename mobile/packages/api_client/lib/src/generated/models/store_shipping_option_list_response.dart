// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'store_shipping_option_list_response_shipping_options.dart';

part 'store_shipping_option_list_response.g.dart';

/// The list of shipping options.
@JsonSerializable()
class StoreShippingOptionListResponse {
  const StoreShippingOptionListResponse({required this.shippingOptions});

  factory StoreShippingOptionListResponse.fromJson(Map<String, Object?> json) =>
      _$StoreShippingOptionListResponseFromJson(json);

  /// The list of shipping options.
  @JsonKey(name: 'shipping_options')
  final List<StoreShippingOptionListResponseShippingOptions> shippingOptions;

  Map<String, Object?> toJson() =>
      _$StoreShippingOptionListResponseToJson(this);
}
