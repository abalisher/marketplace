// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_dismiss_items.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AdminDismissItems _$AdminDismissItemsFromJson(Map<String, dynamic> json) =>
    AdminDismissItems(
      items: (json['items'] as List<dynamic>?)
          ?.map((e) => Items6.fromJson(e as Map<String, dynamic>))
          .toList(),
    );

Map<String, dynamic> _$AdminDismissItemsToJson(AdminDismissItems instance) =>
    <String, dynamic>{'items': instance.items};
