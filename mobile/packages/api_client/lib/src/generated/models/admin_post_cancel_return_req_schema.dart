// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

part 'admin_post_cancel_return_req_schema.g.dart';

/// The details of canceling a return.
@JsonSerializable()
class AdminPostCancelReturnReqSchema {
  const AdminPostCancelReturnReqSchema({this.noNotification});

  factory AdminPostCancelReturnReqSchema.fromJson(Map<String, Object?> json) =>
      _$AdminPostCancelReturnReqSchemaFromJson(json);

  /// Whether to send the customer a notification about the return's cancelation.
  @JsonKey(name: 'no_notification')
  final bool? noNotification;

  Map<String, Object?> toJson() => _$AdminPostCancelReturnReqSchemaToJson(this);
}
