// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_import_product_response.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AdminImportProductResponse _$AdminImportProductResponseFromJson(
  Map<String, dynamic> json,
) => AdminImportProductResponse(
  transactionId: json['transaction_id'] as String,
  summary: Summary.fromJson(json['summary'] as Map<String, dynamic>),
);

Map<String, dynamic> _$AdminImportProductResponseToJson(
  AdminImportProductResponse instance,
) => <String, dynamic>{
  'transaction_id': instance.transactionId,
  'summary': instance.summary,
};
