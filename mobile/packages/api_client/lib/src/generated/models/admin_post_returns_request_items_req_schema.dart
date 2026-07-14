// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'items8.dart';

part 'admin_post_returns_request_items_req_schema.g.dart';

/// The items' details.
@JsonSerializable()
class AdminPostReturnsRequestItemsReqSchema {
  const AdminPostReturnsRequestItemsReqSchema({this.items});

  factory AdminPostReturnsRequestItemsReqSchema.fromJson(
    Map<String, Object?> json,
  ) => _$AdminPostReturnsRequestItemsReqSchemaFromJson(json);

  /// The items' details.
  final List<Items8>? items;

  Map<String, Object?> toJson() =>
      _$AdminPostReturnsRequestItemsReqSchemaToJson(this);
}
