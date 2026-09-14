// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'admin_set_trip_stop_status_status.dart';

part 'admin_set_trip_stop_status.g.dart';

@JsonSerializable()
class AdminSetTripStopStatus {
  const AdminSetTripStopStatus({
    required this.status,
    this.proof,
    this.checklist,
    this.note,
    this.fulfillmentId,
    this.deliveryCode,
  });

  factory AdminSetTripStopStatus.fromJson(Map<String, Object?> json) =>
      _$AdminSetTripStopStatusFromJson(json);

  final AdminSetTripStopStatusStatus status;

  /// Фото-URL'ы и подпись выдачи.
  final dynamic proof;

  /// Чек-лист осмотра при заборе возврата.
  final dynamic checklist;
  final String? note;

  /// Для выдачи delivery-точки: триггерит deliver-order (заказ → delivered).
  @JsonKey(name: 'fulfillment_id')
  final String? fulfillmentId;

  /// Код получения от покупателя (обязателен для delivery в deliver-order).
  @JsonKey(name: 'delivery_code')
  final String? deliveryCode;

  Map<String, Object?> toJson() => _$AdminSetTripStopStatusToJson(this);
}
