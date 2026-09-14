// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_user_list_response.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AdminUserListResponse _$AdminUserListResponseFromJson(
  Map<String, dynamic> json,
) => AdminUserListResponse(
  limit: json['limit'] as num,
  offset: json['offset'] as num,
  count: json['count'] as num,
  users: (json['users'] as List<dynamic>)
      .map((e) => AdminUser.fromJson(e as Map<String, dynamic>))
      .toList(),
  estimateCount: json['estimate_count'] as num?,
);

Map<String, dynamic> _$AdminUserListResponseToJson(
  AdminUserListResponse instance,
) => <String, dynamic>{
  'limit': instance.limit,
  'offset': instance.offset,
  'count': instance.count,
  'users': instance.users,
  'estimate_count': ?instance.estimateCount,
};
