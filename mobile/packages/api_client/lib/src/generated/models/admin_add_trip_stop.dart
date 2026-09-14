// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'admin_add_trip_stop_type.dart';

part 'admin_add_trip_stop.g.dart';

@JsonSerializable()
class AdminAddTripStop {
  const AdminAddTripStop({
    required this.orderId,
    this.type,
    this.sequence,
    this.addressSnapshot,
  });

  factory AdminAddTripStop.fromJson(Map<String, Object?> json) =>
      _$AdminAddTripStopFromJson(json);

  @JsonKey(name: 'order_id')
  final String orderId;
  final AdminAddTripStopType? type;
  final int? sequence;
  @JsonKey(name: 'address_snapshot')
  final dynamic addressSnapshot;

  Map<String, Object?> toJson() => _$AdminAddTripStopToJson(this);
}
