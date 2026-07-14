// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_product_option_value_response.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AdminProductOptionValueResponse _$AdminProductOptionValueResponseFromJson(
  Map<String, dynamic> json,
) => AdminProductOptionValueResponse(
  productOptionValue: AdminProductOptionValue.fromJson(
    json['product_option_value'] as Map<String, dynamic>,
  ),
);

Map<String, dynamic> _$AdminProductOptionValueResponseToJson(
  AdminProductOptionValueResponse instance,
) => <String, dynamic>{'product_option_value': instance.productOptionValue};
