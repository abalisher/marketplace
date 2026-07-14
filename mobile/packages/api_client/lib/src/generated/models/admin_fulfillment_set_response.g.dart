// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_fulfillment_set_response.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AdminFulfillmentSetResponse _$AdminFulfillmentSetResponseFromJson(
  Map<String, dynamic> json,
) => AdminFulfillmentSetResponse(
  fulfillmentSet: AdminFulfillmentSet.fromJson(
    json['fulfillment_set'] as Map<String, dynamic>,
  ),
);

Map<String, dynamic> _$AdminFulfillmentSetResponseToJson(
  AdminFulfillmentSetResponse instance,
) => <String, dynamic>{'fulfillment_set': instance.fulfillmentSet};
