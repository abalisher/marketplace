// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_create_fulfillment_label.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AdminCreateFulfillmentLabel _$AdminCreateFulfillmentLabelFromJson(
  Map<String, dynamic> json,
) => AdminCreateFulfillmentLabel(
  trackingNumber: json['tracking_number'] as String,
  trackingUrl: json['tracking_url'] as String,
  labelUrl: json['label_url'] as String,
);

Map<String, dynamic> _$AdminCreateFulfillmentLabelToJson(
  AdminCreateFulfillmentLabel instance,
) => <String, dynamic>{
  'tracking_number': instance.trackingNumber,
  'tracking_url': instance.trackingUrl,
  'label_url': instance.labelUrl,
};
