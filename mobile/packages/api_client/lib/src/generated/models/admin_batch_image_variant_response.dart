// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

part 'admin_batch_image_variant_response.g.dart';

/// Result of managing the associations between variants and a product image.
@JsonSerializable()
class AdminBatchImageVariantResponse {
  const AdminBatchImageVariantResponse({
    required this.added,
    required this.removed,
  });

  factory AdminBatchImageVariantResponse.fromJson(Map<String, Object?> json) =>
      _$AdminBatchImageVariantResponseFromJson(json);

  /// The IDs of product variants added the image to.
  final List<String> added;

  /// The IDs of product variants removed the image from.
  final List<String> removed;

  Map<String, Object?> toJson() => _$AdminBatchImageVariantResponseToJson(this);
}
