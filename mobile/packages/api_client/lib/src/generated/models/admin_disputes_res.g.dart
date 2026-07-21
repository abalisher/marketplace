// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_disputes_res.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AdminDisputesRes _$AdminDisputesResFromJson(Map<String, dynamic> json) =>
    AdminDisputesRes(
      disputes: (json['disputes'] as List<dynamic>)
          .map((e) => AdminDispute.fromJson(e as Map<String, dynamic>))
          .toList(),
    );

Map<String, dynamic> _$AdminDisputesResToJson(AdminDisputesRes instance) =>
    <String, dynamic>{'disputes': instance.disputes};
