// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_store_credit_account_response.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AdminStoreCreditAccountResponse _$AdminStoreCreditAccountResponseFromJson(
  Map<String, dynamic> json,
) => AdminStoreCreditAccountResponse(
  storeCreditAccount: AdminStoreCreditAccount.fromJson(
    json['store_credit_account'] as Map<String, dynamic>,
  ),
);

Map<String, dynamic> _$AdminStoreCreditAccountResponseToJson(
  AdminStoreCreditAccountResponse instance,
) => <String, dynamic>{'store_credit_account': instance.storeCreditAccount};
