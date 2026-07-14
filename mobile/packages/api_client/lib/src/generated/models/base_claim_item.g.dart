// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'base_claim_item.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

BaseClaimItem _$BaseClaimItemFromJson(Map<String, dynamic> json) =>
    BaseClaimItem(
      id: json['id'] as String,
      claimId: json['claim_id'] as String,
      orderId: json['order_id'] as String,
      itemId: json['item_id'] as String,
      quantity: json['quantity'] as num,
      reason: BaseClaimItemReason.fromJson(json['reason'] as String),
      rawQuantity: RawQuantity.fromJson(
        json['raw_quantity'] as Map<String, dynamic>,
      ),
      metadata: json['metadata'],
      createdAt: json['created_at'] == null
          ? null
          : DateTime.parse(json['created_at'] as String),
      updatedAt: json['updated_at'] == null
          ? null
          : DateTime.parse(json['updated_at'] as String),
      item: json['item'] == null
          ? null
          : AdminOrderLineItem.fromJson(json['item'] as Map<String, dynamic>),
    );

Map<String, dynamic> _$BaseClaimItemToJson(BaseClaimItem instance) =>
    <String, dynamic>{
      'id': instance.id,
      'claim_id': instance.claimId,
      'order_id': instance.orderId,
      'item_id': instance.itemId,
      'quantity': instance.quantity,
      'reason': _$BaseClaimItemReasonEnumMap[instance.reason]!,
      'raw_quantity': instance.rawQuantity,
      'metadata': instance.metadata,
      'created_at': instance.createdAt?.toIso8601String(),
      'updated_at': instance.updatedAt?.toIso8601String(),
      'item': instance.item,
    };

const _$BaseClaimItemReasonEnumMap = {
  BaseClaimItemReason.missingItem: 'missing_item',
  BaseClaimItemReason.wrongItem: 'wrong_item',
  BaseClaimItemReason.productionFailure: 'production_failure',
  BaseClaimItemReason.other: 'other',
  BaseClaimItemReason.$unknown: r'$unknown',
};
