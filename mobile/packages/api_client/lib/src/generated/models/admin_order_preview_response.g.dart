// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_order_preview_response.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AdminOrderPreviewResponse _$AdminOrderPreviewResponseFromJson(
  Map<String, dynamic> json,
) => AdminOrderPreviewResponse(
  order: AdminOrderPreview.fromJson(json['order'] as Map<String, dynamic>),
);

Map<String, dynamic> _$AdminOrderPreviewResponseToJson(
  AdminOrderPreviewResponse instance,
) => <String, dynamic>{'order': instance.order};
