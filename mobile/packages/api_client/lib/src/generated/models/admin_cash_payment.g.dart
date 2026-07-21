// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_cash_payment.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AdminCashPayment _$AdminCashPaymentFromJson(Map<String, dynamic> json) =>
    AdminCashPayment(
      paymentCollectionId: json['payment_collection_id'] as String,
      paymentSessionId: json['payment_session_id'] as String,
      status: json['status'] as String,
    );

Map<String, dynamic> _$AdminCashPaymentToJson(AdminCashPayment instance) =>
    <String, dynamic>{
      'payment_collection_id': instance.paymentCollectionId,
      'payment_session_id': instance.paymentSessionId,
      'status': instance.status,
    };
