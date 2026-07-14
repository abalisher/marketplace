// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

part 'admin_initiate_receive_return.g.dart';

/// The return receival details.
@JsonSerializable()
class AdminInitiateReceiveReturn {
  const AdminInitiateReceiveReturn({
    this.internalNote,
    this.description,
    this.metadata,
  });

  factory AdminInitiateReceiveReturn.fromJson(Map<String, Object?> json) =>
      _$AdminInitiateReceiveReturnFromJson(json);

  /// A note viewed only by admin users.
  @JsonKey(name: 'internal_note')
  final String? internalNote;

  /// The return's description.
  final String? description;

  /// The return's metadata, can hold custom key-value pairs.
  final dynamic metadata;

  Map<String, Object?> toJson() => _$AdminInitiateReceiveReturnToJson(this);
}
