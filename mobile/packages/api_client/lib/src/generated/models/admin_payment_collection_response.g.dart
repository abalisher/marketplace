// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_payment_collection_response.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AdminPaymentCollectionResponse _$AdminPaymentCollectionResponseFromJson(
  Map<String, dynamic> json,
) => AdminPaymentCollectionResponse(
  paymentCollection: AdminPaymentCollection.fromJson(
    json['payment_collection'] as Map<String, dynamic>,
  ),
);

Map<String, dynamic> _$AdminPaymentCollectionResponseToJson(
  AdminPaymentCollectionResponse instance,
) => <String, dynamic>{'payment_collection': instance.paymentCollection};
