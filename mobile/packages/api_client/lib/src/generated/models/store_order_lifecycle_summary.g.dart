// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'store_order_lifecycle_summary.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

StoreOrderLifecycleSummary _$StoreOrderLifecycleSummaryFromJson(
  Map<String, dynamic> json,
) => StoreOrderLifecycleSummary(
  id: json['id'] as String,
  status: StoreOrderLifecycleSummaryStatus.fromJson(json['status'] as String),
  previousStatus: json['previous_status'] as String?,
  note: json['note'] as String?,
  deliveryMethod: json['delivery_method'] == null
      ? null
      : StoreOrderLifecycleSummaryDeliveryMethod.fromJson(
          json['delivery_method'] as String,
        ),
);

Map<String, dynamic> _$StoreOrderLifecycleSummaryToJson(
  StoreOrderLifecycleSummary instance,
) => <String, dynamic>{
  'id': instance.id,
  'status': _$StoreOrderLifecycleSummaryStatusEnumMap[instance.status]!,
  'previous_status': instance.previousStatus,
  'note': instance.note,
  'delivery_method':
      _$StoreOrderLifecycleSummaryDeliveryMethodEnumMap[instance
          .deliveryMethod],
};

const _$StoreOrderLifecycleSummaryStatusEnumMap = {
  StoreOrderLifecycleSummaryStatus.valueNew: 'new',
  StoreOrderLifecycleSummaryStatus.confirmed: 'confirmed',
  StoreOrderLifecycleSummaryStatus.assembling: 'assembling',
  StoreOrderLifecycleSummaryStatus.partiallyAssembled: 'partially_assembled',
  StoreOrderLifecycleSummaryStatus.assembled: 'assembled',
  StoreOrderLifecycleSummaryStatus.inDelivery: 'in_delivery',
  StoreOrderLifecycleSummaryStatus.delivered: 'delivered',
  StoreOrderLifecycleSummaryStatus.closed: 'closed',
  StoreOrderLifecycleSummaryStatus.canceled: 'canceled',
  StoreOrderLifecycleSummaryStatus.returned: 'returned',
  StoreOrderLifecycleSummaryStatus.$unknown: r'$unknown',
};

const _$StoreOrderLifecycleSummaryDeliveryMethodEnumMap = {
  StoreOrderLifecycleSummaryDeliveryMethod.delivery: 'delivery',
  StoreOrderLifecycleSummaryDeliveryMethod.pickup: 'pickup',
  StoreOrderLifecycleSummaryDeliveryMethod.counter: 'counter',
  StoreOrderLifecycleSummaryDeliveryMethod.$unknown: r'$unknown',
};
