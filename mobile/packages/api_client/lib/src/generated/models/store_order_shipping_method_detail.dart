// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'base_order_shipping_detail.dart';

part 'store_order_shipping_method_detail.g.dart';

@JsonSerializable()
class StoreOrderShippingMethodDetail {
  const StoreOrderShippingMethodDetail({
    required this.id,
    required this.shippingMethodId,
    required this.shippingMethod,
    required this.createdAt,
    required this.updatedAt,
    this.claimId,
    this.exchangeId,
    this.returnId,
  });

  factory StoreOrderShippingMethodDetail.fromJson(Map<String, Object?> json) =>
      _$StoreOrderShippingMethodDetailFromJson(json);

  /// The ID of the new changes to the shipping method.
  final String id;

  /// The ID of the shipping method.
  @JsonKey(name: 'shipping_method_id')
  final String shippingMethodId;
  @JsonKey(name: 'shipping_method')
  final dynamic shippingMethod;

  /// The ID of the associated claim.
  @JsonKey(name: 'claim_id')
  final String? claimId;

  /// The ID of the associated exchange.
  @JsonKey(name: 'exchange_id')
  final String? exchangeId;

  /// The ID of the associated return.
  @JsonKey(name: 'return_id')
  final String? returnId;

  /// The date the shipping method change was created.
  @JsonKey(name: 'created_at')
  final DateTime createdAt;

  /// The date the shipping method change was updated.
  @JsonKey(name: 'updated_at')
  final DateTime updatedAt;

  Map<String, Object?> toJson() => _$StoreOrderShippingMethodDetailToJson(this);
}
