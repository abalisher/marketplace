// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'base_payment_session.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

BasePaymentSession _$BasePaymentSessionFromJson(Map<String, dynamic> json) =>
    BasePaymentSession(
      id: json['id'] as String,
      amount: json['amount'] as num,
      currencyCode: json['currency_code'] as String,
      providerId: json['provider_id'] as String,
      data: json['data'],
      status: BasePaymentSessionStatus.fromJson(json['status'] as String),
      context: json['context'],
      authorizedAt: json['authorized_at'] == null
          ? null
          : DateTime.parse(json['authorized_at'] as String),
      paymentCollection: json['payment_collection'],
      payment: json['payment'] == null
          ? null
          : BasePayment.fromJson(json['payment'] as Map<String, dynamic>),
    );

Map<String, dynamic> _$BasePaymentSessionToJson(BasePaymentSession instance) =>
    <String, dynamic>{
      'id': instance.id,
      'amount': instance.amount,
      'currency_code': instance.currencyCode,
      'provider_id': instance.providerId,
      'data': instance.data,
      'context': instance.context,
      'status': _$BasePaymentSessionStatusEnumMap[instance.status]!,
      'authorized_at': instance.authorizedAt?.toIso8601String(),
      'payment_collection': instance.paymentCollection,
      'payment': instance.payment,
    };

const _$BasePaymentSessionStatusEnumMap = {
  BasePaymentSessionStatus.error: 'error',
  BasePaymentSessionStatus.authorized: 'authorized',
  BasePaymentSessionStatus.canceled: 'canceled',
  BasePaymentSessionStatus.captured: 'captured',
  BasePaymentSessionStatus.pending: 'pending',
  BasePaymentSessionStatus.requiresMore: 'requires_more',
  BasePaymentSessionStatus.$unknown: r'$unknown',
};
