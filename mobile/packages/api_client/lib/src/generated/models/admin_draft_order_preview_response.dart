// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'admin_draft_order_preview.dart';

part 'admin_draft_order_preview_response.g.dart';

/// The details of the preview on the draft order.
@JsonSerializable()
class AdminDraftOrderPreviewResponse {
  const AdminDraftOrderPreviewResponse({required this.draftOrderPreview});

  factory AdminDraftOrderPreviewResponse.fromJson(Map<String, Object?> json) =>
      _$AdminDraftOrderPreviewResponseFromJson(json);

  @JsonKey(name: 'draft_order_preview')
  final AdminDraftOrderPreview draftOrderPreview;

  Map<String, Object?> toJson() => _$AdminDraftOrderPreviewResponseToJson(this);
}
