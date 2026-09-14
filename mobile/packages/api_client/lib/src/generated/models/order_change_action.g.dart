// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'order_change_action.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

OrderChangeAction _$OrderChangeActionFromJson(Map<String, dynamic> json) =>
    OrderChangeAction(
      id: json['id'] as String,
      orderChangeId: json['order_change_id'] as String,
      orderChange: json['order_change'],
      orderId: json['order_id'] as String,
      returnId: json['return_id'] as String,
      claimId: json['claim_id'] as String,
      exchangeId: json['exchange_id'] as String,
      order: Order.fromJson(json['order'] as String),
      reference: OrderChangeActionReference.fromJson(
        json['reference'] as String,
      ),
      referenceId: json['reference_id'] as String,
      action: OrderChangeActionAction.fromJson(json['action'] as String),
      details: json['details'],
      internalNote: json['internal_note'] as String,
      createdAt: DateTime.parse(json['created_at'] as String),
      updatedAt: DateTime.parse(json['updated_at'] as String),
      ordering: json['ordering'] as num,
    );

Map<String, dynamic> _$OrderChangeActionToJson(OrderChangeAction instance) =>
    <String, dynamic>{
      'id': instance.id,
      'order_change_id': instance.orderChangeId,
      'order_change': ?instance.orderChange,
      'order_id': instance.orderId,
      'return_id': instance.returnId,
      'claim_id': instance.claimId,
      'exchange_id': instance.exchangeId,
      'order': _$OrderEnumMap[instance.order]!,
      'reference': _$OrderChangeActionReferenceEnumMap[instance.reference]!,
      'reference_id': instance.referenceId,
      'action': _$OrderChangeActionActionEnumMap[instance.action]!,
      'details': ?instance.details,
      'internal_note': instance.internalNote,
      'created_at': instance.createdAt.toIso8601String(),
      'updated_at': instance.updatedAt.toIso8601String(),
      'ordering': instance.ordering,
    };

const _$OrderEnumMap = {
  Order.createdAt: 'created_at',
  Order.minusCreatedAt: '-created_at',
  Order.updatedAt: 'updated_at',
  Order.minusUpdatedAt: '-updated_at',
  Order.$unknown: r'$unknown',
};

const _$OrderChangeActionReferenceEnumMap = {
  OrderChangeActionReference.claim: 'claim',
  OrderChangeActionReference.exchange: 'exchange',
  OrderChangeActionReference.valueReturn: 'return',
  OrderChangeActionReference.orderShippingMethod: 'order_shipping_method',
  OrderChangeActionReference.$unknown: r'$unknown',
};

const _$OrderChangeActionActionEnumMap = {
  OrderChangeActionAction.cancelReturnItem: 'CANCEL_RETURN_ITEM',
  OrderChangeActionAction.fulfillItem: 'FULFILL_ITEM',
  OrderChangeActionAction.deliverItem: 'DELIVER_ITEM',
  OrderChangeActionAction.cancelItemFulfillment: 'CANCEL_ITEM_FULFILLMENT',
  OrderChangeActionAction.itemAdd: 'ITEM_ADD',
  OrderChangeActionAction.itemRemove: 'ITEM_REMOVE',
  OrderChangeActionAction.itemUpdate: 'ITEM_UPDATE',
  OrderChangeActionAction.receiveDamagedReturnItem:
      'RECEIVE_DAMAGED_RETURN_ITEM',
  OrderChangeActionAction.receiveReturnItem: 'RECEIVE_RETURN_ITEM',
  OrderChangeActionAction.returnItem: 'RETURN_ITEM',
  OrderChangeActionAction.shippingAdd: 'SHIPPING_ADD',
  OrderChangeActionAction.shippingRemove: 'SHIPPING_REMOVE',
  OrderChangeActionAction.shipItem: 'SHIP_ITEM',
  OrderChangeActionAction.writeOffItem: 'WRITE_OFF_ITEM',
  OrderChangeActionAction.reinstateItem: 'REINSTATE_ITEM',
  OrderChangeActionAction.$unknown: r'$unknown',
};
