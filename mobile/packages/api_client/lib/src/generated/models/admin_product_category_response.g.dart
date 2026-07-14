// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_product_category_response.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AdminProductCategoryResponse _$AdminProductCategoryResponseFromJson(
  Map<String, dynamic> json,
) => AdminProductCategoryResponse(
  productCategory: AdminProductCategory.fromJson(
    json['product_category'] as Map<String, dynamic>,
  ),
);

Map<String, dynamic> _$AdminProductCategoryResponseToJson(
  AdminProductCategoryResponse instance,
) => <String, dynamic>{'product_category': instance.productCategory};
