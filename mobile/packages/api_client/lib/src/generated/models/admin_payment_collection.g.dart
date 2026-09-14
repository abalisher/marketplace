// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_payment_collection.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AdminPaymentCollection _$AdminPaymentCollectionFromJson(
  Map<String, dynamic> json,
) => AdminPaymentCollection(
  id: json['id'] as String,
  currencyCode: json['currency_code'] as String,
  amount: json['amount'] as num,
  status: AdminPaymentCollectionStatus.fromJson(json['status'] as String),
  paymentProviders: (json['payment_providers'] as List<dynamic>)
      .map((e) => AdminPaymentProvider.fromJson(e as Map<String, dynamic>))
      .toList(),
  authorizedAmount: json['authorized_amount'] as num?,
  capturedAmount: json['captured_amount'] as num?,
  refundedAmount: json['refunded_amount'] as num?,
  completedAt: json['completed_at'] == null
      ? null
      : DateTime.parse(json['completed_at'] as String),
  createdAt: json['created_at'] == null
      ? null
      : DateTime.parse(json['created_at'] as String),
  updatedAt: json['updated_at'] == null
      ? null
      : DateTime.parse(json['updated_at'] as String),
  metadata: json['metadata'],
  paymentSessions: (json['payment_sessions'] as List<dynamic>?)
      ?.map((e) => AdminPaymentSession.fromJson(e as Map<String, dynamic>))
      .toList(),
  payments: (json['payments'] as List<dynamic>?)
      ?.map((e) => AdminPayment.fromJson(e as Map<String, dynamic>))
      .toList(),
);

Map<String, dynamic> _$AdminPaymentCollectionToJson(
  AdminPaymentCollection instance,
) => <String, dynamic>{
  'id': instance.id,
  'currency_code': instance.currencyCode,
  'amount': instance.amount,
  'authorized_amount': ?instance.authorizedAmount,
  'captured_amount': ?instance.capturedAmount,
  'refunded_amount': ?instance.refundedAmount,
  'completed_at': ?instance.completedAt?.toIso8601String(),
  'created_at': ?instance.createdAt?.toIso8601String(),
  'updated_at': ?instance.updatedAt?.toIso8601String(),
  'metadata': ?instance.metadata,
  'status': _$AdminPaymentCollectionStatusEnumMap[instance.status]!,
  'payment_providers': instance.paymentProviders,
  'payment_sessions': ?instance.paymentSessions,
  'payments': ?instance.payments,
};

const _$AdminPaymentCollectionStatusEnumMap = {
  AdminPaymentCollectionStatus.canceled: 'canceled',
  AdminPaymentCollectionStatus.notPaid: 'not_paid',
  AdminPaymentCollectionStatus.awaiting: 'awaiting',
  AdminPaymentCollectionStatus.authorized: 'authorized',
  AdminPaymentCollectionStatus.partiallyAuthorized: 'partially_authorized',
  AdminPaymentCollectionStatus.$unknown: r'$unknown',
};
