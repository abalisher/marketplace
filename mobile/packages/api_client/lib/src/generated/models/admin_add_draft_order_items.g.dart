// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_add_draft_order_items.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AdminAddDraftOrderItems _$AdminAddDraftOrderItemsFromJson(
  Map<String, dynamic> json,
) => AdminAddDraftOrderItems(
  items: (json['items'] as List<dynamic>?)
      ?.map((e) => Items3.fromJson(e as Map<String, dynamic>))
      .toList(),
);

Map<String, dynamic> _$AdminAddDraftOrderItemsToJson(
  AdminAddDraftOrderItems instance,
) => <String, dynamic>{'items': instance.items};
