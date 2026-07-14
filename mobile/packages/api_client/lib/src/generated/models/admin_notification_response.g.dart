// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_notification_response.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AdminNotificationResponse _$AdminNotificationResponseFromJson(
  Map<String, dynamic> json,
) => AdminNotificationResponse(
  notification: AdminNotification.fromJson(
    json['notification'] as Map<String, dynamic>,
  ),
);

Map<String, dynamic> _$AdminNotificationResponseToJson(
  AdminNotificationResponse instance,
) => <String, dynamic>{'notification': instance.notification};
