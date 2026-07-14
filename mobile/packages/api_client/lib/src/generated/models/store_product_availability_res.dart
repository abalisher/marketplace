// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'store_variant_availability.dart';

part 'store_product_availability_res.g.dart';

@JsonSerializable()
class StoreProductAvailabilityRes {
  const StoreProductAvailabilityRes({
    required this.productId,
    required this.variants,
  });

  factory StoreProductAvailabilityRes.fromJson(Map<String, Object?> json) =>
      _$StoreProductAvailabilityResFromJson(json);

  @JsonKey(name: 'product_id')
  final String productId;
  final List<StoreVariantAvailability> variants;

  Map<String, Object?> toJson() => _$StoreProductAvailabilityResToJson(this);
}
