// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'fulfillment_set.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

FulfillmentSet _$FulfillmentSetFromJson(Map<String, dynamic> json) =>
    FulfillmentSet(
      id: json['id'] as String,
      type: json['type'] as String,
      location: Location.fromJson(json['location'] as Map<String, dynamic>),
    );

Map<String, dynamic> _$FulfillmentSetToJson(FulfillmentSet instance) =>
    <String, dynamic>{
      'id': instance.id,
      'type': instance.type,
      'location': instance.location,
    };
