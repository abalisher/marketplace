// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

part 'admin_sales_channel_delete_response.g.dart';

/// The details of deleting a sales channel.
@JsonSerializable()
class AdminSalesChannelDeleteResponse {
  const AdminSalesChannelDeleteResponse({
    required this.id,
    required this.deleted,
    this.object = 'sales-channel',
  });

  factory AdminSalesChannelDeleteResponse.fromJson(Map<String, Object?> json) =>
      _$AdminSalesChannelDeleteResponseFromJson(json);

  /// The sales channel's ID.
  final String id;

  /// The name of the deleted object.
  final String object;

  /// Whether the sales channel was deleted.
  final bool deleted;

  Map<String, Object?> toJson() =>
      _$AdminSalesChannelDeleteResponseToJson(this);
}
