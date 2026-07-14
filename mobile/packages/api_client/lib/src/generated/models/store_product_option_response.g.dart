// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'store_product_option_response.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

StoreProductOptionResponse _$StoreProductOptionResponseFromJson(
  Map<String, dynamic> json,
) => StoreProductOptionResponse(
  productOption: StoreProductOption.fromJson(
    json['product_option'] as Map<String, dynamic>,
  ),
);

Map<String, dynamic> _$StoreProductOptionResponseToJson(
  StoreProductOptionResponse instance,
) => <String, dynamic>{'product_option': instance.productOption};
