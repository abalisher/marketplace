// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'store_product_type_response.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

StoreProductTypeResponse _$StoreProductTypeResponseFromJson(
  Map<String, dynamic> json,
) => StoreProductTypeResponse(
  productType: StoreProductType.fromJson(
    json['product_type'] as Map<String, dynamic>,
  ),
);

Map<String, dynamic> _$StoreProductTypeResponseToJson(
  StoreProductTypeResponse instance,
) => <String, dynamic>{'product_type': instance.productType};
