// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'admin_order_preview.dart';

part 'admin_order_edit_preview_response.g.dart';

/// The preview of an order edit.
@JsonSerializable()
class AdminOrderEditPreviewResponse {
  const AdminOrderEditPreviewResponse({required this.orderPreview});

  factory AdminOrderEditPreviewResponse.fromJson(Map<String, Object?> json) =>
      _$AdminOrderEditPreviewResponseFromJson(json);

  @JsonKey(name: 'order_preview')
  final AdminOrderPreview orderPreview;

  Map<String, Object?> toJson() => _$AdminOrderEditPreviewResponseToJson(this);
}
