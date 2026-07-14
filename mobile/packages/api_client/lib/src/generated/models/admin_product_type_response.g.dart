// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_product_type_response.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AdminProductTypeResponse _$AdminProductTypeResponseFromJson(
  Map<String, dynamic> json,
) => AdminProductTypeResponse(
  productType: AdminProductType.fromJson(
    json['product_type'] as Map<String, dynamic>,
  ),
);

Map<String, dynamic> _$AdminProductTypeResponseToJson(
  AdminProductTypeResponse instance,
) => <String, dynamic>{'product_type': instance.productType};
