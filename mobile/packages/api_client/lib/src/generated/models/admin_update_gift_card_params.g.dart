// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_update_gift_card_params.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AdminUpdateGiftCardParams _$AdminUpdateGiftCardParamsFromJson(
  Map<String, dynamic> json,
) => AdminUpdateGiftCardParams(
  status: json['status'] == null
      ? null
      : AdminUpdateGiftCardParamsStatus.fromJson(json['status'] as String),
  value: json['value'] as num?,
  customerId: json['customer_id'] as String?,
  currencyCode: json['currency_code'] as String?,
  note: json['note'] as String?,
  expiresAt: json['expires_at'] as String?,
  metadata: json['metadata'],
);

Map<String, dynamic> _$AdminUpdateGiftCardParamsToJson(
  AdminUpdateGiftCardParams instance,
) => <String, dynamic>{
  'status': _$AdminUpdateGiftCardParamsStatusEnumMap[instance.status],
  'value': instance.value,
  'customer_id': instance.customerId,
  'currency_code': instance.currencyCode,
  'note': instance.note,
  'expires_at': instance.expiresAt,
  'metadata': instance.metadata,
};

const _$AdminUpdateGiftCardParamsStatusEnumMap = {
  AdminUpdateGiftCardParamsStatus.pending: 'pending',
  AdminUpdateGiftCardParamsStatus.redeemed: 'redeemed',
  AdminUpdateGiftCardParamsStatus.$unknown: r'$unknown',
};
