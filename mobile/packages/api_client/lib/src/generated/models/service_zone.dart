// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'fulfillment_set.dart';

part 'service_zone.g.dart';

@JsonSerializable()
class ServiceZone {
  const ServiceZone({
    required this.id,
    required this.fulfillmentSetId,
    required this.fulfillmentSet,
  });

  factory ServiceZone.fromJson(Map<String, Object?> json) =>
      _$ServiceZoneFromJson(json);

  /// The service zone's ID.
  final String id;

  /// The ID of the service zone's fulfillment set.
  @JsonKey(name: 'fulfillment_set_id')
  final String fulfillmentSetId;

  /// The service zone's fulfillment set.
  @JsonKey(name: 'fulfillment_set')
  final FulfillmentSet fulfillmentSet;

  Map<String, Object?> toJson() => _$ServiceZoneToJson(this);
}
