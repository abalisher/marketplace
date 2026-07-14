// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'admin_fulfillment_set.dart';

part 'admin_service_zone_delete_response.g.dart';

/// The details of the service zone deletion.
@JsonSerializable()
class AdminServiceZoneDeleteResponse {
  const AdminServiceZoneDeleteResponse({
    required this.id,
    required this.deleted,
    this.parent,
    this.object = 'service_zone',
  });

  factory AdminServiceZoneDeleteResponse.fromJson(Map<String, Object?> json) =>
      _$AdminServiceZoneDeleteResponseFromJson(json);

  /// The service zone's ID.
  final String id;

  /// The name of the deleted object.
  final String object;

  /// Whether the service zone was deleted.
  final bool deleted;
  final AdminFulfillmentSet? parent;

  Map<String, Object?> toJson() => _$AdminServiceZoneDeleteResponseToJson(this);
}
