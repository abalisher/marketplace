// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_payment_response.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AdminPaymentResponse _$AdminPaymentResponseFromJson(
  Map<String, dynamic> json,
) => AdminPaymentResponse(
  payment: AdminPayment.fromJson(json['payment'] as Map<String, dynamic>),
);

Map<String, dynamic> _$AdminPaymentResponseToJson(
  AdminPaymentResponse instance,
) => <String, dynamic>{'payment': instance.payment};
