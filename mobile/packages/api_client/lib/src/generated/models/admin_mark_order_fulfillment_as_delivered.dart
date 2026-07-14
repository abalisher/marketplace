// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

part 'admin_mark_order_fulfillment_as_delivered.g.dart';

/// The details of marking an order fulfillment as delivered.
@JsonSerializable()
class AdminMarkOrderFulfillmentAsDelivered {
  const AdminMarkOrderFulfillmentAsDelivered({this.noNotification});

  factory AdminMarkOrderFulfillmentAsDelivered.fromJson(
    Map<String, Object?> json,
  ) => _$AdminMarkOrderFulfillmentAsDeliveredFromJson(json);

  /// Whether to send a notification to the customer about the fulfillment being marked as delivered.
  @JsonKey(name: 'no_notification')
  final bool? noNotification;

  Map<String, Object?> toJson() =>
      _$AdminMarkOrderFulfillmentAsDeliveredToJson(this);
}
