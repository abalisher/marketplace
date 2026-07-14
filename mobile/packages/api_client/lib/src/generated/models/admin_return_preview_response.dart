// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'admin_order_preview.dart';
import 'admin_return.dart';

part 'admin_return_preview_response.g.dart';

/// The details of a return and a preview of the order once the return is applied.
@JsonSerializable()
class AdminReturnPreviewResponse {
  const AdminReturnPreviewResponse({
    required this.orderPreview,
    required this.returnValue,
  });

  factory AdminReturnPreviewResponse.fromJson(Map<String, Object?> json) =>
      _$AdminReturnPreviewResponseFromJson(json);

  @JsonKey(name: 'order_preview')
  final AdminOrderPreview orderPreview;

  /// The name has been replaced because it contains a keyword. Original name: `return`.
  @JsonKey(name: 'return')
  final AdminReturn returnValue;

  Map<String, Object?> toJson() => _$AdminReturnPreviewResponseToJson(this);
}
