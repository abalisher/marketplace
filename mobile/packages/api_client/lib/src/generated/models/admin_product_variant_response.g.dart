// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_product_variant_response.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AdminProductVariantResponse _$AdminProductVariantResponseFromJson(
  Map<String, dynamic> json,
) => AdminProductVariantResponse(
  variant: AdminProductVariant.fromJson(
    json['variant'] as Map<String, dynamic>,
  ),
);

Map<String, dynamic> _$AdminProductVariantResponseToJson(
  AdminProductVariantResponse instance,
) => <String, dynamic>{'variant': instance.variant};
