// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

part 'admin_notification.g.dart';

/// The notification's details.
@JsonSerializable()
class AdminNotification {
  const AdminNotification({
    required this.id,
    required this.to,
    required this.channel,
    required this.template,
    required this.providerId,
    required this.createdAt,
    this.data,
    this.triggerType,
    this.resourceId,
    this.resourceType,
    this.receiverId,
    this.originalNotificationId,
    this.externalId,
  });

  factory AdminNotification.fromJson(Map<String, Object?> json) =>
      _$AdminNotificationFromJson(json);

  /// The notification's ID.
  final String id;

  /// Where to send the notification to. For example, if `channel` is `email`, this can be an email number.
  final String to;

  /// Through which channel is the notification sent through.
  final String channel;

  /// The ID of the template in a third-party service used as the notification's shape.
  final String template;

  /// Data payload to send with the notification.
  final dynamic data;

  /// What triggered this notification.
  @JsonKey(name: 'trigger_type')
  final String? triggerType;

  /// The ID of the associated resource. For example, if the notification was triggered because an order was created, this would be the ID of the order.
  @JsonKey(name: 'resource_id')
  final String? resourceId;

  /// The type of the resource that triggered the notification.
  @JsonKey(name: 'resource_type')
  final String? resourceType;

  /// The ID of the user or customer that's receiving this notification.
  @JsonKey(name: 'receiver_id')
  final String? receiverId;

  /// The ID of the original notification, if this notification is resent.
  @JsonKey(name: 'original_notification_id')
  final String? originalNotificationId;

  /// The ID of the notification in an external or third-party system.
  @JsonKey(name: 'external_id')
  final String? externalId;

  /// The ID of the provider used to send the notification.
  @JsonKey(name: 'provider_id')
  final String providerId;

  /// The date the notification was created.
  @JsonKey(name: 'created_at')
  final DateTime createdAt;

  Map<String, Object?> toJson() => _$AdminNotificationToJson(this);
}
