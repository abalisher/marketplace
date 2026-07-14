// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_create_gift_card_params.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AdminCreateGiftCardParams _$AdminCreateGiftCardParamsFromJson(
  Map<String, dynamic> json,
) => AdminCreateGiftCardParams(
  code: json['code'] as String,
  value: json['value'] as num,
  currencyCode: json['currency_code'] as String,
  expiresAt: json['expires_at'] as String,
  referenceId: json['reference_id'] as String,
  reference: json['reference'] as String,
  lineItemId: json['line_item_id'] as String,
  customerId: json['customer_id'] as String,
  metadata: json['metadata'],
);

Map<String, dynamic> _$AdminCreateGiftCardParamsToJson(
  AdminCreateGiftCardParams instance,
) => <String, dynamic>{
  'code': instance.code,
  'value': instance.value,
  'currency_code': instance.currencyCode,
  'expires_at': instance.expiresAt,
  'reference_id': instance.referenceId,
  'reference': instance.reference,
  'line_item_id': instance.lineItemId,
  'customer_id': instance.customerId,
  'metadata': instance.metadata,
};
