// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_trip_list_res.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AdminTripListRes _$AdminTripListResFromJson(Map<String, dynamic> json) =>
    AdminTripListRes(
      trips: (json['trips'] as List<dynamic>)
          .map((e) => AdminTrip.fromJson(e as Map<String, dynamic>))
          .toList(),
    );

Map<String, dynamic> _$AdminTripListResToJson(AdminTripListRes instance) =>
    <String, dynamic>{'trips': instance.trips};
