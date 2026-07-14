// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'admin_reservation.dart';

part 'admin_reservation_response.g.dart';

/// The reservation's details.
@JsonSerializable()
class AdminReservationResponse {
  const AdminReservationResponse({required this.reservation});

  factory AdminReservationResponse.fromJson(Map<String, Object?> json) =>
      _$AdminReservationResponseFromJson(json);

  final AdminReservation reservation;

  Map<String, Object?> toJson() => _$AdminReservationResponseToJson(this);
}
