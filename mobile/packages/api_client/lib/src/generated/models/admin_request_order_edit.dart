// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

part 'admin_request_order_edit.g.dart';

/// The details of the request to edit an order.
@JsonSerializable()
class AdminRequestOrderEdit {
  const AdminRequestOrderEdit({this.noNotification});

  factory AdminRequestOrderEdit.fromJson(Map<String, Object?> json) =>
      _$AdminRequestOrderEditFromJson(json);

  /// Whether to send notifications to the customer regarding the order edit's updates.
  @JsonKey(name: 'no_notification')
  final bool? noNotification;

  Map<String, Object?> toJson() => _$AdminRequestOrderEditToJson(this);
}
