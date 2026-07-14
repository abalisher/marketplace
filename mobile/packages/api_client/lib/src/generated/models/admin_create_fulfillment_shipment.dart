// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'admin_create_fulfillment_label.dart';

part 'admin_create_fulfillment_shipment.g.dart';

/// Details of the shipment to create for a fulfillment.
@JsonSerializable()
class AdminCreateFulfillmentShipment {
  const AdminCreateFulfillmentShipment({required this.labels});

  factory AdminCreateFulfillmentShipment.fromJson(Map<String, Object?> json) =>
      _$AdminCreateFulfillmentShipmentFromJson(json);

  /// The shipment's labels.
  final List<AdminCreateFulfillmentLabel> labels;

  Map<String, Object?> toJson() => _$AdminCreateFulfillmentShipmentToJson(this);
}
