// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_shipping_option_type_response.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AdminShippingOptionTypeResponse _$AdminShippingOptionTypeResponseFromJson(
  Map<String, dynamic> json,
) => AdminShippingOptionTypeResponse(
  shippingOptionType: AdminShippingOptionType.fromJson(
    json['shipping_option_type'] as Map<String, dynamic>,
  ),
);

Map<String, dynamic> _$AdminShippingOptionTypeResponseToJson(
  AdminShippingOptionTypeResponse instance,
) => <String, dynamic>{'shipping_option_type': instance.shippingOptionType};
