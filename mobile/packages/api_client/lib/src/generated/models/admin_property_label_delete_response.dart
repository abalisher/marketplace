// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

part 'admin_property_label_delete_response.g.dart';

/// The details of deleting a property label.
@JsonSerializable()
class AdminPropertyLabelDeleteResponse {
  const AdminPropertyLabelDeleteResponse({
    required this.id,
    required this.object,
    required this.deleted,
  });

  factory AdminPropertyLabelDeleteResponse.fromJson(
    Map<String, Object?> json,
  ) => _$AdminPropertyLabelDeleteResponseFromJson(json);

  /// The ID of the deleted property label.
  final String id;

  /// The type of the deleted object, which is `property_label`.
  final String object;

  /// Whether the property label was successfully deleted.
  final bool deleted;

  Map<String, Object?> toJson() =>
      _$AdminPropertyLabelDeleteResponseToJson(this);
}
