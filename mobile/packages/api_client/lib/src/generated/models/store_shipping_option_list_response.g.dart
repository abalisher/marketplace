// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'store_shipping_option_list_response.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

StoreShippingOptionListResponse _$StoreShippingOptionListResponseFromJson(
  Map<String, dynamic> json,
) => StoreShippingOptionListResponse(
  shippingOptions: (json['shipping_options'] as List<dynamic>)
      .map(
        (e) => StoreShippingOptionListResponseShippingOptions.fromJson(
          e as Map<String, dynamic>,
        ),
      )
      .toList(),
);

Map<String, dynamic> _$StoreShippingOptionListResponseToJson(
  StoreShippingOptionListResponse instance,
) => <String, dynamic>{'shipping_options': instance.shippingOptions};
