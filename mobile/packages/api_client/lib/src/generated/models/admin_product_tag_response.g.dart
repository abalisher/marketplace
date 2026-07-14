// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_product_tag_response.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AdminProductTagResponse _$AdminProductTagResponseFromJson(
  Map<String, dynamic> json,
) => AdminProductTagResponse(
  productTag: AdminProductTag.fromJson(
    json['product_tag'] as Map<String, dynamic>,
  ),
);

Map<String, dynamic> _$AdminProductTagResponseToJson(
  AdminProductTagResponse instance,
) => <String, dynamic>{'product_tag': instance.productTag};
