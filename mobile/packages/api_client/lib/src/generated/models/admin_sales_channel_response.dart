// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'admin_sales_channel.dart';

part 'admin_sales_channel_response.g.dart';

/// The sales channel's details.
@JsonSerializable()
class AdminSalesChannelResponse {
  const AdminSalesChannelResponse({required this.salesChannel});

  factory AdminSalesChannelResponse.fromJson(Map<String, Object?> json) =>
      _$AdminSalesChannelResponseFromJson(json);

  @JsonKey(name: 'sales_channel')
  final AdminSalesChannel salesChannel;

  Map<String, Object?> toJson() => _$AdminSalesChannelResponseToJson(this);
}
