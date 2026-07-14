// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

part 'admin_batch_variant_images_request.g.dart';

/// Details of the associations between images and a product variant to manage.
@JsonSerializable()
class AdminBatchVariantImagesRequest {
  const AdminBatchVariantImagesRequest({this.add, this.remove});

  factory AdminBatchVariantImagesRequest.fromJson(Map<String, Object?> json) =>
      _$AdminBatchVariantImagesRequestFromJson(json);

  /// The IDs of product images to add to the variant.
  final List<String>? add;

  /// The IDs of product images to remove from the variant.
  final List<String>? remove;

  Map<String, Object?> toJson() => _$AdminBatchVariantImagesRequestToJson(this);
}
