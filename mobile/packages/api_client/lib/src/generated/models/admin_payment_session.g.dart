// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_payment_session.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AdminPaymentSession _$AdminPaymentSessionFromJson(Map<String, dynamic> json) =>
    AdminPaymentSession(
      id: json['id'] as String,
      amount: json['amount'] as num,
      currencyCode: json['currency_code'] as String,
      providerId: json['provider_id'] as String,
      data: json['data'],
      status: AdminPaymentSessionStatus.fromJson(json['status'] as String),
      context: json['context'],
      authorizedAt: json['authorized_at'] == null
          ? null
          : DateTime.parse(json['authorized_at'] as String),
      paymentCollection: json['payment_collection'],
      payment: json['payment'] == null
          ? null
          : BasePayment.fromJson(json['payment'] as Map<String, dynamic>),
    );

Map<String, dynamic> _$AdminPaymentSessionToJson(
  AdminPaymentSession instance,
) => <String, dynamic>{
  'id': instance.id,
  'amount': instance.amount,
  'currency_code': instance.currencyCode,
  'provider_id': instance.providerId,
  'data': instance.data,
  'context': instance.context,
  'status': _$AdminPaymentSessionStatusEnumMap[instance.status]!,
  'authorized_at': instance.authorizedAt?.toIso8601String(),
  'payment_collection': instance.paymentCollection,
  'payment': instance.payment,
};

const _$AdminPaymentSessionStatusEnumMap = {
  AdminPaymentSessionStatus.authorized: 'authorized',
  AdminPaymentSessionStatus.captured: 'captured',
  AdminPaymentSessionStatus.canceled: 'canceled',
  AdminPaymentSessionStatus.pending: 'pending',
  AdminPaymentSessionStatus.requiresMore: 'requires_more',
  AdminPaymentSessionStatus.error: 'error',
  AdminPaymentSessionStatus.$unknown: r'$unknown',
};
