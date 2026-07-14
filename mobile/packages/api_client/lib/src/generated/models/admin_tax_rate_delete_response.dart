// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

part 'admin_tax_rate_delete_response.g.dart';

/// The details of the tax rate deletion.
@JsonSerializable()
class AdminTaxRateDeleteResponse {
  const AdminTaxRateDeleteResponse({
    required this.id,
    required this.deleted,
    this.object = 'tax_rate',
  });

  factory AdminTaxRateDeleteResponse.fromJson(Map<String, Object?> json) =>
      _$AdminTaxRateDeleteResponseFromJson(json);

  /// The tax rate's ID.
  final String id;

  /// The name of the deleted object.
  final String object;

  /// Whether the tax rate was deleted.
  final bool deleted;

  Map<String, Object?> toJson() => _$AdminTaxRateDeleteResponseToJson(this);
}
