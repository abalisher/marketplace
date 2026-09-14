// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_trip_stop.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AdminTripStop _$AdminTripStopFromJson(Map<String, dynamic> json) =>
    AdminTripStop(
      id: json['id'] as String,
      orderId: json['order_id'] as String,
      type: AdminTripStopType.fromJson(json['type'] as String),
      sequence: (json['sequence'] as num).toInt(),
      status: AdminTripStopStatus.fromJson(json['status'] as String),
      addressSnapshot: json['address_snapshot'],
      proof: json['proof'],
      checklist: json['checklist'],
      note: json['note'] as String?,
    );

Map<String, dynamic> _$AdminTripStopToJson(AdminTripStop instance) =>
    <String, dynamic>{
      'id': instance.id,
      'order_id': instance.orderId,
      'type': _$AdminTripStopTypeEnumMap[instance.type]!,
      'sequence': instance.sequence,
      'status': _$AdminTripStopStatusEnumMap[instance.status]!,
      'address_snapshot': ?instance.addressSnapshot,
      'proof': ?instance.proof,
      'checklist': ?instance.checklist,
      'note': ?instance.note,
    };

const _$AdminTripStopTypeEnumMap = {
  AdminTripStopType.delivery: 'delivery',
  AdminTripStopType.returnPickup: 'return_pickup',
  AdminTripStopType.$unknown: r'$unknown',
};

const _$AdminTripStopStatusEnumMap = {
  AdminTripStopStatus.pending: 'pending',
  AdminTripStopStatus.arrived: 'arrived',
  AdminTripStopStatus.done: 'done',
  AdminTripStopStatus.failed: 'failed',
  AdminTripStopStatus.$unknown: r'$unknown',
};
