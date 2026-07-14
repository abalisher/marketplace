// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

part 'store_create_return_shipping.g.dart';

/// The return's shipping details.
@JsonSerializable()
class StoreCreateReturnShipping {
  const StoreCreateReturnShipping({required this.optionId, this.price});

  factory StoreCreateReturnShipping.fromJson(Map<String, Object?> json) =>
      _$StoreCreateReturnShippingFromJson(json);

  /// The ID of the shipping option to use.
  @JsonKey(name: 'option_id')
  final String optionId;

  /// The shipping's price.
  final num? price;

  Map<String, Object?> toJson() => _$StoreCreateReturnShippingToJson(this);
}
