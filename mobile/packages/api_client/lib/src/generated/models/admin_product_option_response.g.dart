// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_product_option_response.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AdminProductOptionResponse _$AdminProductOptionResponseFromJson(
  Map<String, dynamic> json,
) => AdminProductOptionResponse(
  productOption: AdminProductOption.fromJson(
    json['product_option'] as Map<String, dynamic>,
  ),
);

Map<String, dynamic> _$AdminProductOptionResponseToJson(
  AdminProductOptionResponse instance,
) => <String, dynamic>{'product_option': instance.productOption};
