// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'items7.dart';

part 'admin_post_order_edits_add_items_req_schema.g.dart';

/// The details of items to be edited.
@JsonSerializable()
class AdminPostOrderEditsAddItemsReqSchema {
  const AdminPostOrderEditsAddItemsReqSchema({this.items});

  factory AdminPostOrderEditsAddItemsReqSchema.fromJson(
    Map<String, Object?> json,
  ) => _$AdminPostOrderEditsAddItemsReqSchemaFromJson(json);

  /// The details of items to be edited.
  final List<Items7>? items;

  Map<String, Object?> toJson() =>
      _$AdminPostOrderEditsAddItemsReqSchemaToJson(this);
}
