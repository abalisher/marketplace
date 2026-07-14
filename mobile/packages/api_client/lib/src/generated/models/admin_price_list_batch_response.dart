// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'admin_price.dart';
import 'deleted5.dart';

part 'admin_price_list_batch_response.g.dart';

/// The details of the created, updated, and deleted prices in a price list.
@JsonSerializable()
class AdminPriceListBatchResponse {
  const AdminPriceListBatchResponse({
    required this.created,
    required this.updated,
    required this.deleted,
  });

  factory AdminPriceListBatchResponse.fromJson(Map<String, Object?> json) =>
      _$AdminPriceListBatchResponseFromJson(json);

  /// The created prices.
  final List<AdminPrice> created;

  /// The updated prices.
  final List<AdminPrice> updated;

  /// The details of the deleted prices.
  final Deleted5 deleted;

  Map<String, Object?> toJson() => _$AdminPriceListBatchResponseToJson(this);
}
