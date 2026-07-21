// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'store_disputes_res.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

StoreDisputesRes _$StoreDisputesResFromJson(Map<String, dynamic> json) =>
    StoreDisputesRes(
      disputes: (json['disputes'] as List<dynamic>)
          .map((e) => StoreDispute.fromJson(e as Map<String, dynamic>))
          .toList(),
    );

Map<String, dynamic> _$StoreDisputesResToJson(StoreDisputesRes instance) =>
    <String, dynamic>{'disputes': instance.disputes};
