// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_column.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AdminColumn _$AdminColumnFromJson(Map<String, dynamic> json) => AdminColumn(
  id: json['id'] as String,
  name: json['name'] as String,
  field: json['field'] as String,
  sortable: json['sortable'] as bool,
  hideable: json['hideable'] as bool,
  defaultVisible: json['default_visible'] as bool,
  dataType: AdminColumnDataType.fromJson(json['data_type'] as String),
  description: json['description'] as String?,
  semanticType: json['semantic_type'] as String?,
  context: json['context'] as String?,
  computed: json['computed'] == null
      ? null
      : Computed.fromJson(json['computed'] as Map<String, dynamic>),
  relationship: json['relationship'] == null
      ? null
      : Relationship.fromJson(json['relationship'] as Map<String, dynamic>),
  defaultOrder: json['default_order'] as num?,
  category: json['category'] == null
      ? null
      : AdminColumnCategory.fromJson(json['category'] as String),
  renderMode: json['render_mode'] as String?,
  filter: json['filter'] == null
      ? null
      : Filter.fromJson(json['filter'] as Map<String, dynamic>),
  source: json['source'] == null
      ? null
      : Source.fromJson(json['source'] as Map<String, dynamic>),
  customLabel: json['custom_label'] as bool?,
  labelId: json['label_id'] as String?,
);

Map<String, dynamic> _$AdminColumnToJson(AdminColumn instance) =>
    <String, dynamic>{
      'id': instance.id,
      'name': instance.name,
      'description': instance.description,
      'field': instance.field,
      'sortable': instance.sortable,
      'hideable': instance.hideable,
      'default_visible': instance.defaultVisible,
      'data_type': _$AdminColumnDataTypeEnumMap[instance.dataType]!,
      'semantic_type': instance.semanticType,
      'context': instance.context,
      'computed': instance.computed,
      'relationship': instance.relationship,
      'default_order': instance.defaultOrder,
      'category': _$AdminColumnCategoryEnumMap[instance.category],
      'render_mode': instance.renderMode,
      'filter': instance.filter,
      'source': instance.source,
      'custom_label': instance.customLabel,
      'label_id': instance.labelId,
    };

const _$AdminColumnDataTypeEnumMap = {
  AdminColumnDataType.string: 'string',
  AdminColumnDataType.number: 'number',
  AdminColumnDataType.boolean: 'boolean',
  AdminColumnDataType.object: 'object',
  AdminColumnDataType.date: 'date',
  AdminColumnDataType.currency: 'currency',
  AdminColumnDataType.valueEnum: 'enum',
  AdminColumnDataType.$unknown: r'$unknown',
};

const _$AdminColumnCategoryEnumMap = {
  AdminColumnCategory.status: 'status',
  AdminColumnCategory.metadata: 'metadata',
  AdminColumnCategory.identifier: 'identifier',
  AdminColumnCategory.timestamp: 'timestamp',
  AdminColumnCategory.metric: 'metric',
  AdminColumnCategory.relationship: 'relationship',
  AdminColumnCategory.$unknown: r'$unknown',
};
