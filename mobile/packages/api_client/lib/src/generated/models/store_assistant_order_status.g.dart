// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'store_assistant_order_status.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

StoreAssistantOrderStatus _$StoreAssistantOrderStatusFromJson(
  Map<String, dynamic> json,
) => StoreAssistantOrderStatus(
  type: StoreAssistantOrderStatusType.fromJson(json['type'] as String),
  displayId: json['display_id'] as num?,
  statusText: json['status_text'] as String?,
  deliveryStage: json['delivery_stage'] as String?,
  courierNote: json['courier_note'] as String?,
  deliveryCode: json['delivery_code'] as String?,
  deliveryDate: json['delivery_date'] == null
      ? null
      : DateTime.parse(json['delivery_date'] as String),
  deliveryWindow: json['delivery_window'] == null
      ? null
      : StoreAssistantOrderStatusDeliveryWindow.fromJson(
          json['delivery_window'] as String,
        ),
);

Map<String, dynamic> _$StoreAssistantOrderStatusToJson(
  StoreAssistantOrderStatus instance,
) => <String, dynamic>{
  'type': _$StoreAssistantOrderStatusTypeEnumMap[instance.type]!,
  'display_id': ?instance.displayId,
  'status_text': ?instance.statusText,
  'delivery_stage': ?instance.deliveryStage,
  'courier_note': ?instance.courierNote,
  'delivery_code': ?instance.deliveryCode,
  'delivery_date': ?instance.deliveryDate?.toIso8601String(),
  'delivery_window':
      ?_$StoreAssistantOrderStatusDeliveryWindowEnumMap[instance
          .deliveryWindow],
};

const _$StoreAssistantOrderStatusTypeEnumMap = {
  StoreAssistantOrderStatusType.orderStatus: 'order_status',
  StoreAssistantOrderStatusType.$unknown: r'$unknown',
};

const _$StoreAssistantOrderStatusDeliveryWindowEnumMap = {
  StoreAssistantOrderStatusDeliveryWindow.morning: 'morning',
  StoreAssistantOrderStatusDeliveryWindow.day: 'day',
  StoreAssistantOrderStatusDeliveryWindow.evening: 'evening',
  StoreAssistantOrderStatusDeliveryWindow.$unknown: r'$unknown',
};
