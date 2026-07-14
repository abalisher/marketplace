// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_sales_channel_response.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AdminSalesChannelResponse _$AdminSalesChannelResponseFromJson(
  Map<String, dynamic> json,
) => AdminSalesChannelResponse(
  salesChannel: AdminSalesChannel.fromJson(
    json['sales_channel'] as Map<String, dynamic>,
  ),
);

Map<String, dynamic> _$AdminSalesChannelResponseToJson(
  AdminSalesChannelResponse instance,
) => <String, dynamic>{'sales_channel': instance.salesChannel};
