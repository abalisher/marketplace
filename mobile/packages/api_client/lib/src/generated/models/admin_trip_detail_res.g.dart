// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_trip_detail_res.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AdminTripDetailRes _$AdminTripDetailResFromJson(Map<String, dynamic> json) =>
    AdminTripDetailRes(
      trip: AdminTrip.fromJson(json['trip'] as Map<String, dynamic>),
      stops: (json['stops'] as List<dynamic>)
          .map((e) => AdminTripStop.fromJson(e as Map<String, dynamic>))
          .toList(),
    );

Map<String, dynamic> _$AdminTripDetailResToJson(AdminTripDetailRes instance) =>
    <String, dynamic>{'trip': instance.trip, 'stops': instance.stops};
