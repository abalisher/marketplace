// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'store_product_availability_res.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

StoreProductAvailabilityRes _$StoreProductAvailabilityResFromJson(
  Map<String, dynamic> json,
) => StoreProductAvailabilityRes(
  productId: json['product_id'] as String,
  variants: (json['variants'] as List<dynamic>)
      .map((e) => StoreVariantAvailability.fromJson(e as Map<String, dynamic>))
      .toList(),
);

Map<String, dynamic> _$StoreProductAvailabilityResToJson(
  StoreProductAvailabilityRes instance,
) => <String, dynamic>{
  'product_id': instance.productId,
  'variants': instance.variants,
};
