// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'configuration2.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

Configuration2 _$Configuration2FromJson(Map<String, dynamic> json) =>
    Configuration2(
      widgets: (json['widgets'] as Map<String, dynamic>).map(
        (k, e) => MapEntry(k, Widgets.fromJson(e as Map<String, dynamic>)),
      ),
    );

Map<String, dynamic> _$Configuration2ToJson(Configuration2 instance) =>
    <String, dynamic>{'widgets': instance.widgets};
