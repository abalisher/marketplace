// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'store_payment_session.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

StorePaymentSession _$StorePaymentSessionFromJson(Map<String, dynamic> json) =>
    StorePaymentSession(
      id: json['id'] as String,
      amount: json['amount'] as num,
      currencyCode: json['currency_code'] as String,
      providerId: json['provider_id'] as String,
      data: json['data'],
      status: StorePaymentSessionStatus.fromJson(json['status'] as String),
      context: json['context'],
      authorizedAt: json['authorized_at'] == null
          ? null
          : DateTime.parse(json['authorized_at'] as String),
      paymentCollection: json['payment_collection'],
      payment: json['payment'] == null
          ? null
          : BasePayment.fromJson(json['payment'] as Map<String, dynamic>),
    );

Map<String, dynamic> _$StorePaymentSessionToJson(
  StorePaymentSession instance,
) => <String, dynamic>{
  'id': instance.id,
  'amount': instance.amount,
  'currency_code': instance.currencyCode,
  'provider_id': instance.providerId,
  'data': ?instance.data,
  'context': ?instance.context,
  'status': _$StorePaymentSessionStatusEnumMap[instance.status]!,
  'authorized_at': ?instance.authorizedAt?.toIso8601String(),
  'payment_collection': ?instance.paymentCollection,
  'payment': ?instance.payment,
};

const _$StorePaymentSessionStatusEnumMap = {
  StorePaymentSessionStatus.authorized: 'authorized',
  StorePaymentSessionStatus.captured: 'captured',
  StorePaymentSessionStatus.canceled: 'canceled',
  StorePaymentSessionStatus.pending: 'pending',
  StorePaymentSessionStatus.requiresMore: 'requires_more',
  StorePaymentSessionStatus.error: 'error',
  StorePaymentSessionStatus.$unknown: r'$unknown',
};
