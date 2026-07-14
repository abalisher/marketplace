// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'admin_store.dart';

part 'admin_store_response.g.dart';

/// The store's details.
@JsonSerializable()
class AdminStoreResponse {
  const AdminStoreResponse({required this.store});

  factory AdminStoreResponse.fromJson(Map<String, Object?> json) =>
      _$AdminStoreResponseFromJson(json);

  final AdminStore store;

  Map<String, Object?> toJson() => _$AdminStoreResponseToJson(this);
}
