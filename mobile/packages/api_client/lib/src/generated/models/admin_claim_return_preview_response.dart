// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'admin_order_preview.dart';
import 'admin_return.dart';

part 'admin_claim_return_preview_response.g.dart';

/// The details of the claim's return, with a preview of the order when the claim's return is applied.
@JsonSerializable()
class AdminClaimReturnPreviewResponse {
  const AdminClaimReturnPreviewResponse({
    required this.orderPreview,
    required this.returnValue,
  });

  factory AdminClaimReturnPreviewResponse.fromJson(Map<String, Object?> json) =>
      _$AdminClaimReturnPreviewResponseFromJson(json);

  @JsonKey(name: 'order_preview')
  final AdminOrderPreview orderPreview;

  /// The name has been replaced because it contains a keyword. Original name: `return`.
  @JsonKey(name: 'return')
  final AdminReturn returnValue;

  Map<String, Object?> toJson() =>
      _$AdminClaimReturnPreviewResponseToJson(this);
}
