// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

part 'admin_fulfillment_set_delete_response.g.dart';

/// The deletion details.
@JsonSerializable()
class AdminFulfillmentSetDeleteResponse {
  const AdminFulfillmentSetDeleteResponse({
    required this.id,
    required this.deleted,
    this.object = 'fulfillment_set',
  });

  factory AdminFulfillmentSetDeleteResponse.fromJson(
    Map<String, Object?> json,
  ) => _$AdminFulfillmentSetDeleteResponseFromJson(json);

  /// The fulfillment set's ID.
  final String id;

  /// The name of the deleted object.
  final String object;

  /// Whether the fulfillment set was deleted.
  final bool deleted;

  Map<String, Object?> toJson() =>
      _$AdminFulfillmentSetDeleteResponseToJson(this);
}
