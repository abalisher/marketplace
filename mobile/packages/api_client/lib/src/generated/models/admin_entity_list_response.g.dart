// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_entity_list_response.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AdminEntityListResponse _$AdminEntityListResponseFromJson(
  Map<String, dynamic> json,
) => AdminEntityListResponse(
  entities: (json['entities'] as List<dynamic>)
      .map((e) => AdminEntityInfo.fromJson(e as Map<String, dynamic>))
      .toList(),
);

Map<String, dynamic> _$AdminEntityListResponseToJson(
  AdminEntityListResponse instance,
) => <String, dynamic>{'entities': instance.entities};
