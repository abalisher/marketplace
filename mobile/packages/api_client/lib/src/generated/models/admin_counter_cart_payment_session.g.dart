// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_counter_cart_payment_session.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AdminCounterCartPaymentSession _$AdminCounterCartPaymentSessionFromJson(
  Map<String, dynamic> json,
) => AdminCounterCartPaymentSession(
  id: json['id'] as String,
  providerId: json['provider_id'] as String,
  status: json['status'] as String,
);

Map<String, dynamic> _$AdminCounterCartPaymentSessionToJson(
  AdminCounterCartPaymentSession instance,
) => <String, dynamic>{
  'id': instance.id,
  'provider_id': instance.providerId,
  'status': instance.status,
};
