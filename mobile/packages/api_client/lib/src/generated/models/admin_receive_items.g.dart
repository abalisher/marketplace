// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_receive_items.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AdminReceiveItems _$AdminReceiveItemsFromJson(Map<String, dynamic> json) =>
    AdminReceiveItems(
      items: (json['items'] as List<dynamic>?)
          ?.map((e) => Items9.fromJson(e as Map<String, dynamic>))
          .toList(),
    );

Map<String, dynamic> _$AdminReceiveItemsToJson(AdminReceiveItems instance) =>
    <String, dynamic>{'items': instance.items};
