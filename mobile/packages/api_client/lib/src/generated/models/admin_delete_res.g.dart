// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_delete_res.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AdminDeleteRes _$AdminDeleteResFromJson(Map<String, dynamic> json) =>
    AdminDeleteRes(
      id: json['id'] as String,
      object: json['object'] as String,
      deleted: json['deleted'] as bool,
    );

Map<String, dynamic> _$AdminDeleteResToJson(AdminDeleteRes instance) =>
    <String, dynamic>{
      'id': instance.id,
      'object': instance.object,
      'deleted': instance.deleted,
    };
