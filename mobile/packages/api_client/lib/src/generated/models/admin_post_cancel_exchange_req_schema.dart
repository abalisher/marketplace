// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

part 'admin_post_cancel_exchange_req_schema.g.dart';

/// The details of canceling an exchange.
@JsonSerializable()
class AdminPostCancelExchangeReqSchema {
  const AdminPostCancelExchangeReqSchema({this.noNotification});

  factory AdminPostCancelExchangeReqSchema.fromJson(
    Map<String, Object?> json,
  ) => _$AdminPostCancelExchangeReqSchemaFromJson(json);

  /// Whether to send a notification to the customer about the exchange's cancelation.
  @JsonKey(name: 'no_notification')
  final bool? noNotification;

  Map<String, Object?> toJson() =>
      _$AdminPostCancelExchangeReqSchemaToJson(this);
}
