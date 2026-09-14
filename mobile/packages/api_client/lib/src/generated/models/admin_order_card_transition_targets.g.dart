// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_order_card_transition_targets.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AdminOrderCardTransitionTargets _$AdminOrderCardTransitionTargetsFromJson(
  Map<String, dynamic> json,
) => AdminOrderCardTransitionTargets(
  items: (json['items'] as List<dynamic>)
      .map((e) => AdminOrderLineInput.fromJson(e as Map<String, dynamic>))
      .toList(),
  shipFulfillmentId: json['ship_fulfillment_id'] as String?,
  deliverFulfillmentId: json['deliver_fulfillment_id'] as String?,
);

Map<String, dynamic> _$AdminOrderCardTransitionTargetsToJson(
  AdminOrderCardTransitionTargets instance,
) => <String, dynamic>{
  'items': instance.items,
  'ship_fulfillment_id': ?instance.shipFulfillmentId,
  'deliver_fulfillment_id': ?instance.deliverFulfillmentId,
};
