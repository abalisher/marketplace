// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_update_return_request.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AdminUpdateReturnRequest _$AdminUpdateReturnRequestFromJson(
  Map<String, dynamic> json,
) => AdminUpdateReturnRequest(
  locationId: json['location_id'] as String?,
  noNotification: json['no_notification'] as bool?,
  metadata: json['metadata'],
);

Map<String, dynamic> _$AdminUpdateReturnRequestToJson(
  AdminUpdateReturnRequest instance,
) => <String, dynamic>{
  'location_id': instance.locationId,
  'no_notification': instance.noNotification,
  'metadata': instance.metadata,
};
