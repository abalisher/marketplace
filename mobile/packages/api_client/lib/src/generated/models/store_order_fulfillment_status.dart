// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

/// The order's fulfillment status.
@JsonEnum()
enum StoreOrderFulfillmentStatus {
  @JsonValue('canceled')
  canceled('canceled'),
  @JsonValue('not_fulfilled')
  notFulfilled('not_fulfilled'),
  @JsonValue('partially_fulfilled')
  partiallyFulfilled('partially_fulfilled'),
  @JsonValue('fulfilled')
  fulfilled('fulfilled'),
  @JsonValue('partially_shipped')
  partiallyShipped('partially_shipped'),
  @JsonValue('shipped')
  shipped('shipped'),
  @JsonValue('partially_delivered')
  partiallyDelivered('partially_delivered'),
  @JsonValue('delivered')
  delivered('delivered'),

  /// Default value for all unparsed values, allows backward compatibility when adding new values on the backend.
  $unknown(null);

  const StoreOrderFulfillmentStatus(this.json);

  factory StoreOrderFulfillmentStatus.fromJson(String json) =>
      values.firstWhere((e) => e.json == json, orElse: () => $unknown);

  final String? json;

  @override
  String toString() => json?.toString() ?? super.toString();

  /// Returns all defined enum values excluding the $unknown value.
  static List<StoreOrderFulfillmentStatus> get $valuesDefined =>
      values.where((value) => value != $unknown).toList();
}
