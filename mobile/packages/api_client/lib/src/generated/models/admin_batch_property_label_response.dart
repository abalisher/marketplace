// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'admin_property_label.dart';
import 'deleted3.dart';

part 'admin_batch_property_label_response.g.dart';

/// The response of managing property labels.
@JsonSerializable()
class AdminBatchPropertyLabelResponse {
  const AdminBatchPropertyLabelResponse({
    required this.created,
    required this.updated,
    required this.deleted,
  });

  factory AdminBatchPropertyLabelResponse.fromJson(Map<String, Object?> json) =>
      _$AdminBatchPropertyLabelResponseFromJson(json);

  /// The created property labels.
  final List<AdminPropertyLabel> created;

  /// The updated property labels.
  final List<AdminPropertyLabel> updated;

  /// The deleted property labels.
  final List<Deleted3> deleted;

  Map<String, Object?> toJson() =>
      _$AdminBatchPropertyLabelResponseToJson(this);
}
