// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'create.dart';
import 'update.dart';

part 'admin_batch_property_labels.g.dart';

/// The property labels to manage.
@JsonSerializable()
class AdminBatchPropertyLabels {
  const AdminBatchPropertyLabels({this.create, this.update, this.delete});

  factory AdminBatchPropertyLabels.fromJson(Map<String, Object?> json) =>
      _$AdminBatchPropertyLabelsFromJson(json);

  /// The property labels to create.
  final List<Create>? create;

  /// The property labels to update.
  final List<Update>? update;

  /// The property labels to delete.
  final List<String>? delete;

  Map<String, Object?> toJson() => _$AdminBatchPropertyLabelsToJson(this);
}
