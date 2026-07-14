// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'store_collection_response.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

StoreCollectionResponse _$StoreCollectionResponseFromJson(
  Map<String, dynamic> json,
) => StoreCollectionResponse(
  collection: StoreCollection.fromJson(
    json['collection'] as Map<String, dynamic>,
  ),
);

Map<String, dynamic> _$StoreCollectionResponseToJson(
  StoreCollectionResponse instance,
) => <String, dynamic>{'collection': instance.collection};
