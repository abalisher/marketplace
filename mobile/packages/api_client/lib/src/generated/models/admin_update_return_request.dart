// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

part 'admin_update_return_request.g.dart';

/// The return's details.
@JsonSerializable()
class AdminUpdateReturnRequest {
  const AdminUpdateReturnRequest({
    this.locationId,
    this.noNotification,
    this.metadata,
  });

  factory AdminUpdateReturnRequest.fromJson(Map<String, Object?> json) =>
      _$AdminUpdateReturnRequestFromJson(json);

  /// The ID of the location to return items to.
  @JsonKey(name: 'location_id')
  final String? locationId;

  /// Whether the customer should receive notifications about updates to the return.
  @JsonKey(name: 'no_notification')
  final bool? noNotification;

  /// The return's metadata, can hold custom key-value pairs.
  final dynamic metadata;

  Map<String, Object?> toJson() => _$AdminUpdateReturnRequestToJson(this);
}
