// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_add_return_items.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AdminAddReturnItems _$AdminAddReturnItemsFromJson(Map<String, dynamic> json) =>
    AdminAddReturnItems(
      items: (json['items'] as List<dynamic>)
          .map((e) => AdminAddReturnItem.fromJson(e as Map<String, dynamic>))
          .toList(),
    );

Map<String, dynamic> _$AdminAddReturnItemsToJson(
  AdminAddReturnItems instance,
) => <String, dynamic>{'items': instance.items};
