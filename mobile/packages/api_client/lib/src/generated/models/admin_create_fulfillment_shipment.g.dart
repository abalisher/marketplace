// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_create_fulfillment_shipment.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AdminCreateFulfillmentShipment _$AdminCreateFulfillmentShipmentFromJson(
  Map<String, dynamic> json,
) => AdminCreateFulfillmentShipment(
  labels: (json['labels'] as List<dynamic>)
      .map(
        (e) => AdminCreateFulfillmentLabel.fromJson(e as Map<String, dynamic>),
      )
      .toList(),
);

Map<String, dynamic> _$AdminCreateFulfillmentShipmentToJson(
  AdminCreateFulfillmentShipment instance,
) => <String, dynamic>{'labels': instance.labels};
