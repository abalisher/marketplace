// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_set_trip_status.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AdminSetTripStatus _$AdminSetTripStatusFromJson(Map<String, dynamic> json) =>
    AdminSetTripStatus(
      status: AdminSetTripStatusStatus.fromJson(json['status'] as String),
    );

Map<String, dynamic> _$AdminSetTripStatusToJson(AdminSetTripStatus instance) =>
    <String, dynamic>{
      'status': _$AdminSetTripStatusStatusEnumMap[instance.status]!,
    };

const _$AdminSetTripStatusStatusEnumMap = {
  AdminSetTripStatusStatus.planned: 'planned',
  AdminSetTripStatusStatus.loading: 'loading',
  AdminSetTripStatusStatus.enRoute: 'en_route',
  AdminSetTripStatusStatus.completed: 'completed',
  AdminSetTripStatusStatus.canceled: 'canceled',
  AdminSetTripStatusStatus.$unknown: r'$unknown',
};
