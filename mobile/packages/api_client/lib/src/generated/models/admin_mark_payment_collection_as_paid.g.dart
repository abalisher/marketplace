// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_mark_payment_collection_as_paid.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AdminMarkPaymentCollectionAsPaid _$AdminMarkPaymentCollectionAsPaidFromJson(
  Map<String, dynamic> json,
) => AdminMarkPaymentCollectionAsPaid(
  orderId: json['order_id'] as String,
  providerId: json['provider_id'] as String?,
);

Map<String, dynamic> _$AdminMarkPaymentCollectionAsPaidToJson(
  AdminMarkPaymentCollectionAsPaid instance,
) => <String, dynamic>{
  'order_id': instance.orderId,
  'provider_id': instance.providerId,
};
