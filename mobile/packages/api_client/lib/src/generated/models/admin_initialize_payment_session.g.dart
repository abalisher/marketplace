// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_initialize_payment_session.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AdminInitializePaymentSession _$AdminInitializePaymentSessionFromJson(
  Map<String, dynamic> json,
) => AdminInitializePaymentSession(
  providerId: json['provider_id'] as String,
  data: json['data'],
);

Map<String, dynamic> _$AdminInitializePaymentSessionToJson(
  AdminInitializePaymentSession instance,
) => <String, dynamic>{
  'provider_id': instance.providerId,
  'data': instance.data,
};
