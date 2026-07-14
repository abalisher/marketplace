// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_initiate_return_request.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AdminInitiateReturnRequest _$AdminInitiateReturnRequestFromJson(
  Map<String, dynamic> json,
) => AdminInitiateReturnRequest(
  orderId: json['order_id'] as String,
  locationId: json['location_id'] as String?,
  description: json['description'] as String?,
  internalNote: json['internal_note'] as String?,
  noNotification: json['no_notification'] as bool?,
  metadata: json['metadata'],
);

Map<String, dynamic> _$AdminInitiateReturnRequestToJson(
  AdminInitiateReturnRequest instance,
) => <String, dynamic>{
  'order_id': instance.orderId,
  'location_id': instance.locationId,
  'description': instance.description,
  'internal_note': instance.internalNote,
  'no_notification': instance.noNotification,
  'metadata': instance.metadata,
};
