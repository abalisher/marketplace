// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_draft_order_response.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AdminDraftOrderResponse _$AdminDraftOrderResponseFromJson(
  Map<String, dynamic> json,
) => AdminDraftOrderResponse(
  draftOrder: AdminDraftOrder.fromJson(
    json['draft_order'] as Map<String, dynamic>,
  ),
);

Map<String, dynamic> _$AdminDraftOrderResponseToJson(
  AdminDraftOrderResponse instance,
) => <String, dynamic>{'draft_order': instance.draftOrder};
