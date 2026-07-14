// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'admin_notification.dart';

part 'admin_notification_response.g.dart';

/// The notification's details.
@JsonSerializable()
class AdminNotificationResponse {
  const AdminNotificationResponse({required this.notification});

  factory AdminNotificationResponse.fromJson(Map<String, Object?> json) =>
      _$AdminNotificationResponseFromJson(json);

  final AdminNotification notification;

  Map<String, Object?> toJson() => _$AdminNotificationResponseToJson(this);
}
