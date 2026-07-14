// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'configuration5.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

Configuration5 _$Configuration5FromJson(Map<String, dynamic> json) =>
    Configuration5(
      visibleColumns: (json['visible_columns'] as List<dynamic>)
          .map((e) => e as String)
          .toList(),
      columnOrder: (json['column_order'] as List<dynamic>)
          .map((e) => e as String)
          .toList(),
      columnWidths: json['column_widths'],
      filters: json['filters'],
      sorting: json['sorting'] == null
          ? null
          : Sorting3.fromJson(json['sorting'] as Map<String, dynamic>),
      search: json['search'] as String?,
    );

Map<String, dynamic> _$Configuration5ToJson(Configuration5 instance) =>
    <String, dynamic>{
      'visible_columns': instance.visibleColumns,
      'column_order': instance.columnOrder,
      'column_widths': instance.columnWidths,
      'filters': instance.filters,
      'sorting': instance.sorting,
      'search': instance.search,
    };
