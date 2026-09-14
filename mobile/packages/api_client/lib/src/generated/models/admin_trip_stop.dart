// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'admin_trip_stop_status.dart';
import 'admin_trip_stop_type.dart';

part 'admin_trip_stop.g.dart';

@JsonSerializable()
class AdminTripStop {
  const AdminTripStop({
    required this.id,
    required this.orderId,
    required this.type,
    required this.sequence,
    required this.status,
    this.addressSnapshot,
    this.proof,
    this.checklist,
    this.note,
  });

  factory AdminTripStop.fromJson(Map<String, Object?> json) =>
      _$AdminTripStopFromJson(json);

  final String id;
  @JsonKey(name: 'order_id')
  final String orderId;
  final AdminTripStopType type;
  final int sequence;
  final AdminTripStopStatus status;
  @JsonKey(name: 'address_snapshot')
  final dynamic addressSnapshot;
  final dynamic proof;
  final dynamic checklist;
  final String? note;

  Map<String, Object?> toJson() => _$AdminTripStopToJson(this);
}
