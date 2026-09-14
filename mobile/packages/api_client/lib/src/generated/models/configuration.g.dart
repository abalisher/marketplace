// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'configuration.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

Configuration _$ConfigurationFromJson(Map<String, dynamic> json) =>
    Configuration(
      visibleColumns: (json['visible_columns'] as List<dynamic>)
          .map((e) => e as String)
          .toList(),
      columnOrder: (json['column_order'] as List<dynamic>)
          .map((e) => e as String)
          .toList(),
      search: json['search'] as String?,
      columnWidths: json['column_widths'],
      filters: json['filters'],
      sorting: json['sorting'] == null
          ? null
          : Sorting.fromJson(json['sorting'] as Map<String, dynamic>),
    );

Map<String, dynamic> _$ConfigurationToJson(Configuration instance) =>
    <String, dynamic>{
      'visible_columns': instance.visibleColumns,
      'column_order': instance.columnOrder,
      'search': ?instance.search,
      'column_widths': ?instance.columnWidths,
      'filters': ?instance.filters,
      'sorting': ?instance.sorting,
    };
