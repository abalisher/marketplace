// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_gift_card.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AdminGiftCard _$AdminGiftCardFromJson(Map<String, dynamic> json) =>
    AdminGiftCard(
      lineItem: AdminOrderLineItem.fromJson(
        json['line_item'] as Map<String, dynamic>,
      ),
      customer: AdminCustomer.fromJson(
        json['customer'] as Map<String, dynamic>,
      ),
      id: json['id'] as String,
      code: json['code'] as String,
      status: AdminGiftCardStatus.fromJson(json['status'] as String),
      value: json['value'] as num,
      currencyCode: json['currency_code'] as String,
      customerId: json['customer_id'] as String,
      referenceId: json['reference_id'] as String,
      note: json['note'] as String,
      reference: json['reference'] as String,
      expiresAt: json['expires_at'] as String,
      createdAt: DateTime.parse(json['created_at'] as String),
      updatedAt: DateTime.parse(json['updated_at'] as String),
    );

Map<String, dynamic> _$AdminGiftCardToJson(AdminGiftCard instance) =>
    <String, dynamic>{
      'line_item': instance.lineItem,
      'customer': instance.customer,
      'id': instance.id,
      'code': instance.code,
      'status': _$AdminGiftCardStatusEnumMap[instance.status]!,
      'value': instance.value,
      'currency_code': instance.currencyCode,
      'customer_id': instance.customerId,
      'reference_id': instance.referenceId,
      'note': instance.note,
      'reference': instance.reference,
      'expires_at': instance.expiresAt,
      'created_at': instance.createdAt.toIso8601String(),
      'updated_at': instance.updatedAt.toIso8601String(),
    };

const _$AdminGiftCardStatusEnumMap = {
  AdminGiftCardStatus.pending: 'pending',
  AdminGiftCardStatus.redeemed: 'redeemed',
  AdminGiftCardStatus.$unknown: r'$unknown',
};
