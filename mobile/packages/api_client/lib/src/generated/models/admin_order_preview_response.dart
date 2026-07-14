// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'admin_order_preview.dart';

part 'admin_order_preview_response.g.dart';

/// The preview of an order.
@JsonSerializable()
class AdminOrderPreviewResponse {
  const AdminOrderPreviewResponse({required this.order});

  factory AdminOrderPreviewResponse.fromJson(Map<String, Object?> json) =>
      _$AdminOrderPreviewResponseFromJson(json);

  final AdminOrderPreview order;

  Map<String, Object?> toJson() => _$AdminOrderPreviewResponseToJson(this);
}
