// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_notification_list_response.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AdminNotificationListResponse _$AdminNotificationListResponseFromJson(
  Map<String, dynamic> json,
) => AdminNotificationListResponse(
  limit: json['limit'] as num,
  offset: json['offset'] as num,
  count: json['count'] as num,
  notifications: (json['notifications'] as List<dynamic>)
      .map((e) => AdminNotification.fromJson(e as Map<String, dynamic>))
      .toList(),
  estimateCount: json['estimate_count'] as num?,
);

Map<String, dynamic> _$AdminNotificationListResponseToJson(
  AdminNotificationListResponse instance,
) => <String, dynamic>{
  'limit': instance.limit,
  'offset': instance.offset,
  'count': instance.count,
  'notifications': instance.notifications,
  'estimate_count': instance.estimateCount,
};
