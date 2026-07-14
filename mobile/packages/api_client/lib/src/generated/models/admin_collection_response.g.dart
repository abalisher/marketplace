// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_collection_response.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AdminCollectionResponse _$AdminCollectionResponseFromJson(
  Map<String, dynamic> json,
) => AdminCollectionResponse(
  collection: AdminCollection.fromJson(
    json['collection'] as Map<String, dynamic>,
  ),
);

Map<String, dynamic> _$AdminCollectionResponseToJson(
  AdminCollectionResponse instance,
) => <String, dynamic>{'collection': instance.collection};
