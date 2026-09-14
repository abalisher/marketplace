// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_set_trip_stop_status.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AdminSetTripStopStatus _$AdminSetTripStopStatusFromJson(
  Map<String, dynamic> json,
) => AdminSetTripStopStatus(
  status: AdminSetTripStopStatusStatus.fromJson(json['status'] as String),
  proof: json['proof'],
  checklist: json['checklist'],
  note: json['note'] as String?,
  fulfillmentId: json['fulfillment_id'] as String?,
  deliveryCode: json['delivery_code'] as String?,
);

Map<String, dynamic> _$AdminSetTripStopStatusToJson(
  AdminSetTripStopStatus instance,
) => <String, dynamic>{
  'status': _$AdminSetTripStopStatusStatusEnumMap[instance.status]!,
  'proof': ?instance.proof,
  'checklist': ?instance.checklist,
  'note': ?instance.note,
  'fulfillment_id': ?instance.fulfillmentId,
  'delivery_code': ?instance.deliveryCode,
};

const _$AdminSetTripStopStatusStatusEnumMap = {
  AdminSetTripStopStatusStatus.pending: 'pending',
  AdminSetTripStopStatusStatus.arrived: 'arrived',
  AdminSetTripStopStatusStatus.done: 'done',
  AdminSetTripStopStatusStatus.failed: 'failed',
  AdminSetTripStopStatusStatus.$unknown: r'$unknown',
};
