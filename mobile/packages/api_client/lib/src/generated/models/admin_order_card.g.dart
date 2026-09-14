// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_order_card.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AdminOrderCard _$AdminOrderCardFromJson(
  Map<String, dynamic> json,
) => AdminOrderCard(
  orderId: json['order_id'] as String,
  history: (json['history'] as List<dynamic>)
      .map((e) => AdminOrderLifecycleEvent.fromJson(e as Map<String, dynamic>))
      .toList(),
  customer: AdminOrderCardCustomer.fromJson(
    json['customer'] as Map<String, dynamic>,
  ),
  items: (json['items'] as List<dynamic>)
      .map((e) => AdminOrderCardItem.fromJson(e as Map<String, dynamic>))
      .toList(),
  totals: AdminOrderCardTotals.fromJson(json['totals'] as Map<String, dynamic>),
  delivery: AdminOrderCardDelivery.fromJson(
    json['delivery'] as Map<String, dynamic>,
  ),
  documents: (json['documents'] as List<dynamic>)
      .map((e) => AdminOrderDocument.fromJson(e as Map<String, dynamic>))
      .toList(),
  transitionTargets: AdminOrderCardTransitionTargets.fromJson(
    json['transition_targets'] as Map<String, dynamic>,
  ),
  displayId: (json['display_id'] as num?)?.toInt(),
  createdAt: json['created_at'] == null
      ? null
      : DateTime.parse(json['created_at'] as String),
  status: json['status'] as String?,
  previousStatus: json['previous_status'] as String?,
  note: json['note'] as String?,
  deliveryMethod: json['delivery_method'] == null
      ? null
      : AdminOrderCardDeliveryMethod.fromJson(
          json['delivery_method'] as String,
        ),
  credit: json['credit'] == null
      ? null
      : AdminOrderCardCredit.fromJson(json['credit'] as Map<String, dynamic>),
  paymentState: json['payment_state'] == null
      ? null
      : AdminOrderCardPaymentState.fromJson(json['payment_state'] as String),
  activeDispute: json['active_dispute'] == null
      ? null
      : AdminOrderCardDispute.fromJson(
          json['active_dispute'] as Map<String, dynamic>,
        ),
);

Map<String, dynamic> _$AdminOrderCardToJson(
  AdminOrderCard instance,
) => <String, dynamic>{
  'order_id': instance.orderId,
  'display_id': ?instance.displayId,
  'created_at': ?instance.createdAt?.toIso8601String(),
  'status': ?instance.status,
  'previous_status': ?instance.previousStatus,
  'note': ?instance.note,
  'delivery_method':
      ?_$AdminOrderCardDeliveryMethodEnumMap[instance.deliveryMethod],
  'history': instance.history,
  'customer': instance.customer,
  'credit': ?instance.credit,
  'items': instance.items,
  'totals': instance.totals,
  'payment_state': ?_$AdminOrderCardPaymentStateEnumMap[instance.paymentState],
  'delivery': instance.delivery,
  'documents': instance.documents,
  'transition_targets': instance.transitionTargets,
  'active_dispute': ?instance.activeDispute,
};

const _$AdminOrderCardDeliveryMethodEnumMap = {
  AdminOrderCardDeliveryMethod.delivery: 'delivery',
  AdminOrderCardDeliveryMethod.$unknown: r'$unknown',
};

const _$AdminOrderCardPaymentStateEnumMap = {
  AdminOrderCardPaymentState.paid: 'paid',
  AdminOrderCardPaymentState.awaiting: 'awaiting',
  AdminOrderCardPaymentState.canceled: 'canceled',
  AdminOrderCardPaymentState.$unknown: r'$unknown',
};
