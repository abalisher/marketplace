// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

part 'admin_batch_variant_images_response.g.dart';

/// Result of managing the associations between images and a product variant.
@JsonSerializable()
class AdminBatchVariantImagesResponse {
  const AdminBatchVariantImagesResponse({
    required this.added,
    required this.removed,
  });

  factory AdminBatchVariantImagesResponse.fromJson(Map<String, Object?> json) =>
      _$AdminBatchVariantImagesResponseFromJson(json);

  /// The IDs of product images added to the variant.
  final List<String> added;

  /// The IDs of product images removed from the variant.
  final List<String> removed;

  Map<String, Object?> toJson() =>
      _$AdminBatchVariantImagesResponseToJson(this);
}
