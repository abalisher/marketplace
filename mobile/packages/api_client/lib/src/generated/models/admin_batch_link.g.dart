// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_batch_link.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AdminBatchLink _$AdminBatchLinkFromJson(Map<String, dynamic> json) =>
    AdminBatchLink(
      add: (json['add'] as List<dynamic>?)?.map((e) => e as String).toList(),
      remove: (json['remove'] as List<dynamic>?)
          ?.map((e) => e as String)
          .toList(),
    );

Map<String, dynamic> _$AdminBatchLinkToJson(AdminBatchLink instance) =>
    <String, dynamic>{'add': ?instance.add, 'remove': ?instance.remove};
