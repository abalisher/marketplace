// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'store_order_lifecycle_res.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

StoreOrderLifecycleRes _$StoreOrderLifecycleResFromJson(
  Map<String, dynamic> json,
) => StoreOrderLifecycleRes(
  orderId: json['order_id'] as String,
  history: (json['history'] as List<dynamic>)
      .map((e) => StoreOrderLifecycleEvent.fromJson(e as Map<String, dynamic>))
      .toList(),
  status: json['status'] as String?,
  previousStatus: json['previous_status'] as String?,
  note: json['note'] as String?,
);

Map<String, dynamic> _$StoreOrderLifecycleResToJson(
  StoreOrderLifecycleRes instance,
) => <String, dynamic>{
  'order_id': instance.orderId,
  'status': instance.status,
  'previous_status': instance.previousStatus,
  'note': instance.note,
  'history': instance.history,
};
