// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_cash_payment_res.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AdminCashPaymentRes _$AdminCashPaymentResFromJson(Map<String, dynamic> json) =>
    AdminCashPaymentRes(
      payment: AdminCashPayment.fromJson(
        json['payment'] as Map<String, dynamic>,
      ),
    );

Map<String, dynamic> _$AdminCashPaymentResToJson(
  AdminCashPaymentRes instance,
) => <String, dynamic>{'payment': instance.payment};
