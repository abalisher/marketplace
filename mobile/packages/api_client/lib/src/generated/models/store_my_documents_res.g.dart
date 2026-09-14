// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'store_my_documents_res.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

StoreMyDocumentsRes _$StoreMyDocumentsResFromJson(Map<String, dynamic> json) =>
    StoreMyDocumentsRes(
      documents: (json['documents'] as List<dynamic>)
          .map((e) => StoreMyDocument.fromJson(e as Map<String, dynamic>))
          .toList(),
    );

Map<String, dynamic> _$StoreMyDocumentsResToJson(
  StoreMyDocumentsRes instance,
) => <String, dynamic>{'documents': instance.documents};
