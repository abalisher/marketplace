// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

part 'admin_draft_order_params.g.dart';

/// The parameters for retrieving draft orders.
@JsonSerializable()
class AdminDraftOrderParams {
  const AdminDraftOrderParams({this.fields});

  factory AdminDraftOrderParams.fromJson(Map<String, Object?> json) =>
      _$AdminDraftOrderParamsFromJson(json);

  /// Comma-separated fields that should be included in the returned data. if a field is prefixed with `+` it will be added to the default fields, using `-` will remove it from the default fields. without prefix it will replace the entire default fields.
  final String? fields;

  Map<String, Object?> toJson() => _$AdminDraftOrderParamsToJson(this);
}
