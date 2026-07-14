// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_transactions_response.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AdminTransactionsResponse _$AdminTransactionsResponseFromJson(
  Map<String, dynamic> json,
) => AdminTransactionsResponse(
  limit: json['limit'] as num,
  offset: json['offset'] as num,
  count: json['count'] as num,
  transactions: (json['transactions'] as List<dynamic>)
      .map((e) => AdminTransaction.fromJson(e as Map<String, dynamic>))
      .toList(),
  estimateCount: json['estimate_count'] as num?,
);

Map<String, dynamic> _$AdminTransactionsResponseToJson(
  AdminTransactionsResponse instance,
) => <String, dynamic>{
  'limit': instance.limit,
  'offset': instance.offset,
  'count': instance.count,
  'transactions': instance.transactions,
  'estimate_count': instance.estimateCount,
};
