// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_index_details_response.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AdminIndexDetailsResponse _$AdminIndexDetailsResponseFromJson(
  Map<String, dynamic> json,
) => AdminIndexDetailsResponse(
  metadata: (json['metadata'] as List<dynamic>?)
      ?.map((e) => IndexInfo.fromJson(e as Map<String, dynamic>))
      .toList(),
);

Map<String, dynamic> _$AdminIndexDetailsResponseToJson(
  AdminIndexDetailsResponse instance,
) => <String, dynamic>{'metadata': ?instance.metadata};
