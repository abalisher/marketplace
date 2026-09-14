// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_trip.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AdminTrip _$AdminTripFromJson(Map<String, dynamic> json) => AdminTrip(
  id: json['id'] as String,
  driverId: json['driver_id'] as String,
  locationId: json['location_id'] as String,
  status: AdminTripStatus.fromJson(json['status'] as String),
  startedAt: json['started_at'] == null
      ? null
      : DateTime.parse(json['started_at'] as String),
  finishedAt: json['finished_at'] == null
      ? null
      : DateTime.parse(json['finished_at'] as String),
  note: json['note'] as String?,
);

Map<String, dynamic> _$AdminTripToJson(AdminTrip instance) => <String, dynamic>{
  'id': instance.id,
  'driver_id': instance.driverId,
  'location_id': instance.locationId,
  'status': _$AdminTripStatusEnumMap[instance.status]!,
  'started_at': ?instance.startedAt?.toIso8601String(),
  'finished_at': ?instance.finishedAt?.toIso8601String(),
  'note': ?instance.note,
};

const _$AdminTripStatusEnumMap = {
  AdminTripStatus.planned: 'planned',
  AdminTripStatus.loading: 'loading',
  AdminTripStatus.enRoute: 'en_route',
  AdminTripStatus.completed: 'completed',
  AdminTripStatus.canceled: 'canceled',
  AdminTripStatus.$unknown: r'$unknown',
};
