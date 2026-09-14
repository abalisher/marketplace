// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_add_trip_stop.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AdminAddTripStop _$AdminAddTripStopFromJson(Map<String, dynamic> json) =>
    AdminAddTripStop(
      orderId: json['order_id'] as String,
      type: json['type'] == null
          ? null
          : AdminAddTripStopType.fromJson(json['type'] as String),
      sequence: (json['sequence'] as num?)?.toInt(),
      addressSnapshot: json['address_snapshot'],
    );

Map<String, dynamic> _$AdminAddTripStopToJson(AdminAddTripStop instance) =>
    <String, dynamic>{
      'order_id': instance.orderId,
      'type': ?_$AdminAddTripStopTypeEnumMap[instance.type],
      'sequence': ?instance.sequence,
      'address_snapshot': ?instance.addressSnapshot,
    };

const _$AdminAddTripStopTypeEnumMap = {
  AdminAddTripStopType.delivery: 'delivery',
  AdminAddTripStopType.returnPickup: 'return_pickup',
  AdminAddTripStopType.$unknown: r'$unknown',
};
