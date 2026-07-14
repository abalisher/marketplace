// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

part 'admin_tax_provider.g.dart';

/// The tax provider's details.
@JsonSerializable()
class AdminTaxProvider {
  const AdminTaxProvider({required this.id, required this.isEnabled});

  factory AdminTaxProvider.fromJson(Map<String, Object?> json) =>
      _$AdminTaxProviderFromJson(json);

  /// The tax provider's ID.
  final String id;

  /// Whether the tax provider is enabled in the Medusa application.
  @JsonKey(name: 'is_enabled')
  final bool isEnabled;

  Map<String, Object?> toJson() => _$AdminTaxProviderToJson(this);
}
