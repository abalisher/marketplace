// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'store_gift_card.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

StoreGiftCard _$StoreGiftCardFromJson(Map<String, dynamic> json) =>
    StoreGiftCard(
      customer: StoreCustomer.fromJson(
        json['customer'] as Map<String, dynamic>,
      ),
      lineItem: StoreOrderLineItem.fromJson(
        json['line_item'] as Map<String, dynamic>,
      ),
      id: json['id'] as String,
      code: json['code'] as String,
      status: StoreGiftCardStatus.fromJson(json['status'] as String),
      value: json['value'] as num,
      currencyCode: json['currency_code'] as String,
      customerId: json['customer_id'] as String,
      referenceId: json['reference_id'] as String,
      note: json['note'] as String,
      reference: json['reference'] as String,
      expiresAt: DateTime.parse(json['expires_at'] as String),
      createdAt: DateTime.parse(json['created_at'] as String),
      updatedAt: DateTime.parse(json['updated_at'] as String),
    );

Map<String, dynamic> _$StoreGiftCardToJson(StoreGiftCard instance) =>
    <String, dynamic>{
      'customer': instance.customer,
      'line_item': instance.lineItem,
      'id': instance.id,
      'code': instance.code,
      'status': _$StoreGiftCardStatusEnumMap[instance.status]!,
      'value': instance.value,
      'currency_code': instance.currencyCode,
      'customer_id': instance.customerId,
      'reference_id': instance.referenceId,
      'note': instance.note,
      'reference': instance.reference,
      'expires_at': instance.expiresAt.toIso8601String(),
      'created_at': instance.createdAt.toIso8601String(),
      'updated_at': instance.updatedAt.toIso8601String(),
    };

const _$StoreGiftCardStatusEnumMap = {
  StoreGiftCardStatus.pending: 'pending',
  StoreGiftCardStatus.redeemed: 'redeemed',
  StoreGiftCardStatus.$unknown: r'$unknown',
};
