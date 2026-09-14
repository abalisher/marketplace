// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'store_assistant_payment.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

StoreAssistantPayment _$StoreAssistantPaymentFromJson(
  Map<String, dynamic> json,
) => StoreAssistantPayment(
  type: StoreAssistantPaymentType.fromJson(json['type'] as String),
  provider: StoreAssistantPaymentProvider.fromJson(json['provider'] as String),
  status: json['status'] as String,
  paid: json['paid'] as bool,
  amount: json['amount'] as num?,
  currency: json['currency'] as String,
  qrPayload: json['qr_payload'] as String?,
  paymentUrl: json['payment_url'] as String?,
);

Map<String, dynamic> _$StoreAssistantPaymentToJson(
  StoreAssistantPayment instance,
) => <String, dynamic>{
  'type': _$StoreAssistantPaymentTypeEnumMap[instance.type]!,
  'provider': _$StoreAssistantPaymentProviderEnumMap[instance.provider]!,
  'status': instance.status,
  'paid': instance.paid,
  'amount': ?instance.amount,
  'currency': instance.currency,
  'qr_payload': ?instance.qrPayload,
  'payment_url': ?instance.paymentUrl,
};

const _$StoreAssistantPaymentTypeEnumMap = {
  StoreAssistantPaymentType.payment: 'payment',
  StoreAssistantPaymentType.$unknown: r'$unknown',
};

const _$StoreAssistantPaymentProviderEnumMap = {
  StoreAssistantPaymentProvider.kaspi: 'kaspi',
  StoreAssistantPaymentProvider.$unknown: r'$unknown',
};
