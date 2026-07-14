// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'store_product_tag_response.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

StoreProductTagResponse _$StoreProductTagResponseFromJson(
  Map<String, dynamic> json,
) => StoreProductTagResponse(
  productTag: StoreProductTag.fromJson(
    json['product_tag'] as Map<String, dynamic>,
  ),
);

Map<String, dynamic> _$StoreProductTagResponseToJson(
  StoreProductTagResponse instance,
) => <String, dynamic>{'product_tag': instance.productTag};
