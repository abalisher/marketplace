// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_fulfillment_response.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AdminFulfillmentResponse _$AdminFulfillmentResponseFromJson(
  Map<String, dynamic> json,
) => AdminFulfillmentResponse(
  fulfillment: AdminFulfillment.fromJson(
    json['fulfillment'] as Map<String, dynamic>,
  ),
);

Map<String, dynamic> _$AdminFulfillmentResponseToJson(
  AdminFulfillmentResponse instance,
) => <String, dynamic>{'fulfillment': instance.fulfillment};
