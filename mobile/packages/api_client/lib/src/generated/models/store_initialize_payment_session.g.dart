// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'store_initialize_payment_session.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

StoreInitializePaymentSession _$StoreInitializePaymentSessionFromJson(
  Map<String, dynamic> json,
) => StoreInitializePaymentSession(
  providerId: json['provider_id'] as String,
  data: json['data'],
);

Map<String, dynamic> _$StoreInitializePaymentSessionToJson(
  StoreInitializePaymentSession instance,
) => <String, dynamic>{
  'provider_id': instance.providerId,
  'data': instance.data,
};
