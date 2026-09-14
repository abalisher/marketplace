// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_claim.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AdminClaim _$AdminClaimFromJson(Map<String, dynamic> json) => AdminClaim(
  id: json['id'] as String,
  orderId: json['order_id'] as String,
  claimItems: (json['claim_items'] as List<dynamic>)
      .map((e) => BaseClaimItem.fromJson(e as Map<String, dynamic>))
      .toList(),
  additionalItems: (json['additional_items'] as List<dynamic>)
      .map((e) => BaseClaimItem.fromJson(e as Map<String, dynamic>))
      .toList(),
  returnValue: AdminReturn.fromJson(json['return'] as Map<String, dynamic>),
  displayId: json['display_id'] as num,
  createdAt: DateTime.parse(json['created_at'] as String),
  updatedAt: DateTime.parse(json['updated_at'] as String),
  order: AdminOrder.fromJson(json['order'] as Map<String, dynamic>),
  type: AdminClaimType.fromJson(json['type'] as String),
  orderVersion: json['order_version'] as String,
  canceledAt: DateTime.parse(json['canceled_at'] as String),
  returnId: json['return_id'] as String?,
  noNotification: json['no_notification'] as bool?,
  refundAmount: json['refund_amount'] as num?,
  shippingMethods: (json['shipping_methods'] as List<dynamic>?)
      ?.map((e) => AdminOrderShippingMethod.fromJson(e as Map<String, dynamic>))
      .toList(),
  transactions: (json['transactions'] as List<dynamic>?)
      ?.map((e) => BaseOrderTransaction.fromJson(e as Map<String, dynamic>))
      .toList(),
  metadata: json['metadata'],
  createdBy: json['created_by'] as String?,
  deletedAt: json['deleted_at'] == null
      ? null
      : DateTime.parse(json['deleted_at'] as String),
);

Map<String, dynamic> _$AdminClaimToJson(AdminClaim instance) =>
    <String, dynamic>{
      'id': instance.id,
      'order_id': instance.orderId,
      'claim_items': instance.claimItems,
      'additional_items': instance.additionalItems,
      'return': instance.returnValue,
      'return_id': ?instance.returnId,
      'no_notification': ?instance.noNotification,
      'refund_amount': ?instance.refundAmount,
      'display_id': instance.displayId,
      'shipping_methods': ?instance.shippingMethods,
      'transactions': ?instance.transactions,
      'metadata': ?instance.metadata,
      'created_at': instance.createdAt.toIso8601String(),
      'updated_at': instance.updatedAt.toIso8601String(),
      'order': instance.order,
      'type': _$AdminClaimTypeEnumMap[instance.type]!,
      'order_version': instance.orderVersion,
      'created_by': ?instance.createdBy,
      'canceled_at': instance.canceledAt.toIso8601String(),
      'deleted_at': ?instance.deletedAt?.toIso8601String(),
    };

const _$AdminClaimTypeEnumMap = {
  AdminClaimType.replace: 'replace',
  AdminClaimType.refund: 'refund',
  AdminClaimType.$unknown: r'$unknown',
};
