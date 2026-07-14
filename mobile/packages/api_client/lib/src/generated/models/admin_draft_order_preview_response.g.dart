// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_draft_order_preview_response.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AdminDraftOrderPreviewResponse _$AdminDraftOrderPreviewResponseFromJson(
  Map<String, dynamic> json,
) => AdminDraftOrderPreviewResponse(
  draftOrderPreview: AdminDraftOrderPreview.fromJson(
    json['draft_order_preview'] as Map<String, dynamic>,
  ),
);

Map<String, dynamic> _$AdminDraftOrderPreviewResponseToJson(
  AdminDraftOrderPreviewResponse instance,
) => <String, dynamic>{'draft_order_preview': instance.draftOrderPreview};
