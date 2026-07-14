// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'admin_price_list.dart';

part 'admin_price_list_response.g.dart';

/// The price list's details.
@JsonSerializable()
class AdminPriceListResponse {
  const AdminPriceListResponse({required this.priceList});

  factory AdminPriceListResponse.fromJson(Map<String, Object?> json) =>
      _$AdminPriceListResponseFromJson(json);

  @JsonKey(name: 'price_list')
  final AdminPriceList priceList;

  Map<String, Object?> toJson() => _$AdminPriceListResponseToJson(this);
}
