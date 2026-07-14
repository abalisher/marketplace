// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_create_payment_collection.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AdminCreatePaymentCollection _$AdminCreatePaymentCollectionFromJson(
  Map<String, dynamic> json,
) => AdminCreatePaymentCollection(
  orderId: json['order_id'] as String,
  amount: json['amount'] as num,
);

Map<String, dynamic> _$AdminCreatePaymentCollectionToJson(
  AdminCreatePaymentCollection instance,
) => <String, dynamic>{'order_id': instance.orderId, 'amount': instance.amount};
