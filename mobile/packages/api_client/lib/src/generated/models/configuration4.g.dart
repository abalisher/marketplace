// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'configuration4.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

Configuration4 _$Configuration4FromJson(Map<String, dynamic> json) =>
    Configuration4(
      search: json['search'] as String?,
      visibleColumns: (json['visible_columns'] as List<dynamic>?)
          ?.map((e) => e as String)
          .toList(),
      columnOrder: (json['column_order'] as List<dynamic>?)
          ?.map((e) => e as String)
          .toList(),
      columnWidths: json['column_widths'],
      filters: json['filters'],
      sorting: json['sorting'] == null
          ? null
          : Sorting2.fromJson(json['sorting'] as Map<String, dynamic>),
    );

Map<String, dynamic> _$Configuration4ToJson(Configuration4 instance) =>
    <String, dynamic>{
      'search': instance.search,
      'visible_columns': instance.visibleColumns,
      'column_order': instance.columnOrder,
      'column_widths': instance.columnWidths,
      'filters': instance.filters,
      'sorting': instance.sorting,
    };
