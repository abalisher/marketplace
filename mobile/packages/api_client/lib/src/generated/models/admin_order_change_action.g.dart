// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_order_change_action.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AdminOrderChangeAction _$AdminOrderChangeActionFromJson(
  Map<String, dynamic> json,
) => AdminOrderChangeAction(
  id: json['id'] as String,
  orderChangeId: json['order_change_id'] as String,
  orderChange: json['order_change'],
  orderId: json['order_id'] as String,
  returnId: json['return_id'] as String,
  claimId: json['claim_id'] as String,
  exchangeId: json['exchange_id'] as String,
  order: AdminOrder.fromJson(json['order'] as Map<String, dynamic>),
  reference: AdminOrderChangeActionReference.fromJson(
    json['reference'] as String,
  ),
  referenceId: json['reference_id'] as String,
  action: AdminOrderChangeActionAction.fromJson(json['action'] as String),
  details: json['details'],
  internalNote: json['internal_note'] as String,
  createdAt: DateTime.parse(json['created_at'] as String),
  updatedAt: DateTime.parse(json['updated_at'] as String),
  ordering: json['ordering'] as num,
);

Map<String, dynamic> _$AdminOrderChangeActionToJson(
  AdminOrderChangeAction instance,
) => <String, dynamic>{
  'id': instance.id,
  'order_change_id': instance.orderChangeId,
  'order_change': ?instance.orderChange,
  'order_id': instance.orderId,
  'return_id': instance.returnId,
  'claim_id': instance.claimId,
  'exchange_id': instance.exchangeId,
  'order': instance.order,
  'reference': _$AdminOrderChangeActionReferenceEnumMap[instance.reference]!,
  'reference_id': instance.referenceId,
  'action': _$AdminOrderChangeActionActionEnumMap[instance.action]!,
  'details': ?instance.details,
  'internal_note': instance.internalNote,
  'created_at': instance.createdAt.toIso8601String(),
  'updated_at': instance.updatedAt.toIso8601String(),
  'ordering': instance.ordering,
};

const _$AdminOrderChangeActionReferenceEnumMap = {
  AdminOrderChangeActionReference.claim: 'claim',
  AdminOrderChangeActionReference.exchange: 'exchange',
  AdminOrderChangeActionReference.valueReturn: 'return',
  AdminOrderChangeActionReference.orderShippingMethod: 'order_shipping_method',
  AdminOrderChangeActionReference.$unknown: r'$unknown',
};

const _$AdminOrderChangeActionActionEnumMap = {
  AdminOrderChangeActionAction.cancelReturnItem: 'CANCEL_RETURN_ITEM',
  AdminOrderChangeActionAction.fulfillItem: 'FULFILL_ITEM',
  AdminOrderChangeActionAction.deliverItem: 'DELIVER_ITEM',
  AdminOrderChangeActionAction.cancelItemFulfillment: 'CANCEL_ITEM_FULFILLMENT',
  AdminOrderChangeActionAction.itemAdd: 'ITEM_ADD',
  AdminOrderChangeActionAction.itemRemove: 'ITEM_REMOVE',
  AdminOrderChangeActionAction.itemUpdate: 'ITEM_UPDATE',
  AdminOrderChangeActionAction.receiveDamagedReturnItem:
      'RECEIVE_DAMAGED_RETURN_ITEM',
  AdminOrderChangeActionAction.receiveReturnItem: 'RECEIVE_RETURN_ITEM',
  AdminOrderChangeActionAction.returnItem: 'RETURN_ITEM',
  AdminOrderChangeActionAction.shippingAdd: 'SHIPPING_ADD',
  AdminOrderChangeActionAction.shippingRemove: 'SHIPPING_REMOVE',
  AdminOrderChangeActionAction.shipItem: 'SHIP_ITEM',
  AdminOrderChangeActionAction.writeOffItem: 'WRITE_OFF_ITEM',
  AdminOrderChangeActionAction.reinstateItem: 'REINSTATE_ITEM',
  AdminOrderChangeActionAction.$unknown: r'$unknown',
};
