// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'admin_property_label.dart';

part 'admin_property_label_list_response.g.dart';

/// The paginated list of property labels.
@JsonSerializable()
class AdminPropertyLabelListResponse {
  const AdminPropertyLabelListResponse({
    required this.propertyLabels,
    required this.count,
    required this.offset,
    required this.limit,
  });

  factory AdminPropertyLabelListResponse.fromJson(Map<String, Object?> json) =>
      _$AdminPropertyLabelListResponseFromJson(json);

  /// TThe list of property labels.
  @JsonKey(name: 'property_labels')
  final List<AdminPropertyLabel> propertyLabels;

  /// The total number of property labels.
  final num count;

  /// The number of items skipped before retrieving the returned items.
  final num offset;

  /// The maximum number of items returned.
  final num limit;

  Map<String, Object?> toJson() => _$AdminPropertyLabelListResponseToJson(this);
}
