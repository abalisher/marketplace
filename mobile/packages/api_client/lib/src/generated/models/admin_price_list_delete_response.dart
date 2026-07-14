// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

part 'admin_price_list_delete_response.g.dart';

/// The details of the deleted price list.
@JsonSerializable()
class AdminPriceListDeleteResponse {
  const AdminPriceListDeleteResponse({
    required this.id,
    required this.deleted,
    this.object = 'price_list',
  });

  factory AdminPriceListDeleteResponse.fromJson(Map<String, Object?> json) =>
      _$AdminPriceListDeleteResponseFromJson(json);

  /// The price list's ID.
  final String id;

  /// The name of the deleted object.
  final String object;

  /// Whether the price list was deleted.
  final bool deleted;

  Map<String, Object?> toJson() => _$AdminPriceListDeleteResponseToJson(this);
}
