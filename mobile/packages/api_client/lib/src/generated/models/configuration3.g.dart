// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'configuration3.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

Configuration3 _$Configuration3FromJson(Map<String, dynamic> json) =>
    Configuration3(
      widgets: (json['widgets'] as Map<String, dynamic>).map(
        (k, e) => MapEntry(k, Widgets2.fromJson(e as Map<String, dynamic>)),
      ),
    );

Map<String, dynamic> _$Configuration3ToJson(Configuration3 instance) =>
    <String, dynamic>{'widgets': instance.widgets};
