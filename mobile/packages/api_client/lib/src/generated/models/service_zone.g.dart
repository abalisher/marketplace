// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'service_zone.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

ServiceZone _$ServiceZoneFromJson(Map<String, dynamic> json) => ServiceZone(
  id: json['id'] as String,
  fulfillmentSetId: json['fulfillment_set_id'] as String,
  fulfillmentSet: FulfillmentSet.fromJson(
    json['fulfillment_set'] as Map<String, dynamic>,
  ),
);

Map<String, dynamic> _$ServiceZoneToJson(ServiceZone instance) =>
    <String, dynamic>{
      'id': instance.id,
      'fulfillment_set_id': instance.fulfillmentSetId,
      'fulfillment_set': instance.fulfillmentSet,
    };
