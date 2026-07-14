// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

part 'admin_batch_image_variant_request.g.dart';

/// Details of the associations between variants and a product image to manage.
@JsonSerializable()
class AdminBatchImageVariantRequest {
  const AdminBatchImageVariantRequest({this.add, this.remove});

  factory AdminBatchImageVariantRequest.fromJson(Map<String, Object?> json) =>
      _$AdminBatchImageVariantRequestFromJson(json);

  /// The IDs of product variants to add the image to.
  final List<String>? add;

  /// The IDs of product variants to remove the image from.
  final List<String>? remove;

  Map<String, Object?> toJson() => _$AdminBatchImageVariantRequestToJson(this);
}
