// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

part 'admin_tax_region_delete_response.g.dart';

/// The details of the tax region deletion.
@JsonSerializable()
class AdminTaxRegionDeleteResponse {
  const AdminTaxRegionDeleteResponse({
    required this.id,
    required this.deleted,
    this.object = 'tax_region',
  });

  factory AdminTaxRegionDeleteResponse.fromJson(Map<String, Object?> json) =>
      _$AdminTaxRegionDeleteResponseFromJson(json);

  /// The tax region's ID.
  final String id;

  /// The name of the deleted object.
  final String object;

  /// Whether the tax region was deleted.
  final bool deleted;

  Map<String, Object?> toJson() => _$AdminTaxRegionDeleteResponseToJson(this);
}
