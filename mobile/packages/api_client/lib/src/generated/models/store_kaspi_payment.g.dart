// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'store_kaspi_payment.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

StoreKaspiPayment _$StoreKaspiPaymentFromJson(Map<String, dynamic> json) =>
    StoreKaspiPayment(
      paymentCollectionId: json['payment_collection_id'] as String,
      paymentSessionId: json['payment_session_id'] as String,
      status: StoreKaspiPaymentStatus.fromJson(json['status'] as String),
      kaspiState: json['kaspi_state'] as String?,
      qrPayload: json['qr_payload'] as String?,
      paymentUrl: json['payment_url'] as String?,
    );

Map<String, dynamic> _$StoreKaspiPaymentToJson(StoreKaspiPayment instance) =>
    <String, dynamic>{
      'payment_collection_id': instance.paymentCollectionId,
      'payment_session_id': instance.paymentSessionId,
      'status': _$StoreKaspiPaymentStatusEnumMap[instance.status]!,
      'kaspi_state': ?instance.kaspiState,
      'qr_payload': ?instance.qrPayload,
      'payment_url': ?instance.paymentUrl,
    };

const _$StoreKaspiPaymentStatusEnumMap = {
  StoreKaspiPaymentStatus.pending: 'pending',
  StoreKaspiPaymentStatus.requiresMore: 'requires_more',
  StoreKaspiPaymentStatus.authorized: 'authorized',
  StoreKaspiPaymentStatus.captured: 'captured',
  StoreKaspiPaymentStatus.canceled: 'canceled',
  StoreKaspiPaymentStatus.error: 'error',
  StoreKaspiPaymentStatus.$unknown: r'$unknown',
};
