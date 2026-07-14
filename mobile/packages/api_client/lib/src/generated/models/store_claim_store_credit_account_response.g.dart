// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'store_claim_store_credit_account_response.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

StoreClaimStoreCreditAccountResponse
_$StoreClaimStoreCreditAccountResponseFromJson(Map<String, dynamic> json) =>
    StoreClaimStoreCreditAccountResponse(
      storeCreditAccount: StoreStoreCreditAccount.fromJson(
        json['store_credit_account'] as Map<String, dynamic>,
      ),
    );

Map<String, dynamic> _$StoreClaimStoreCreditAccountResponseToJson(
  StoreClaimStoreCreditAccountResponse instance,
) => <String, dynamic>{'store_credit_account': instance.storeCreditAccount};
