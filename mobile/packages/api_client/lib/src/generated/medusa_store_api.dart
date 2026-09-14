// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:dio/dio.dart';

import 'clients/auth_client.dart';
import 'clients/multi_factor_authentication_mfa_factors_client.dart';
import 'clients/carts_client.dart';
import 'clients/collections_client.dart';
import 'clients/currencies_client.dart';
import 'clients/customers_client.dart';
import 'clients/gift_cards_client.dart';
import 'clients/locales_client.dart';
import 'clients/orders_client.dart';
import 'clients/payment_collections_client.dart';
import 'clients/payment_providers_client.dart';
import 'clients/product_categories_client.dart';
import 'clients/product_options_client.dart';
import 'clients/product_tags_client.dart';
import 'clients/product_types_client.dart';
import 'clients/product_variants_client.dart';
import 'clients/products_client.dart';
import 'clients/regions_client.dart';
import 'clients/return_reasons_client.dart';
import 'clients/returns_client.dart';
import 'clients/shipping_options_client.dart';
import 'clients/store_credit_accounts_client.dart';
import 'clients/admin_auth_client.dart';
import 'clients/admin_orders_client.dart';
import 'clients/admin_products_client.dart';
import 'clients/admin_stock_locations_client.dart';
import 'clients/assembly_client.dart';
import 'clients/logistics_client.dart';
import 'clients/catalog_client.dart';
import 'clients/reviews_client.dart';
import 'clients/assistant_client.dart';
import 'clients/bonus_client.dart';
import 'clients/payment_client.dart';
import 'clients/companies_client.dart';
import 'clients/documents_client.dart';
import 'clients/estimator_client.dart';

/// Medusa Storefront API `v2.20.1`
class MedusaStoreApi {
  MedusaStoreApi(Dio dio, {String? baseUrl}) : _dio = dio, _baseUrl = baseUrl;

  final Dio _dio;
  final String? _baseUrl;

  static String get version => '2.20.1';

  AuthClient? _auth;
  MultiFactorAuthenticationMfaFactorsClient?
  _multiFactorAuthenticationMfaFactors;
  CartsClient? _carts;
  CollectionsClient? _collections;
  CurrenciesClient? _currencies;
  CustomersClient? _customers;
  GiftCardsClient? _giftCards;
  LocalesClient? _locales;
  OrdersClient? _orders;
  PaymentCollectionsClient? _paymentCollections;
  PaymentProvidersClient? _paymentProviders;
  ProductCategoriesClient? _productCategories;
  ProductOptionsClient? _productOptions;
  ProductTagsClient? _productTags;
  ProductTypesClient? _productTypes;
  ProductVariantsClient? _productVariants;
  ProductsClient? _products;
  RegionsClient? _regions;
  ReturnReasonsClient? _returnReasons;
  ReturnsClient? _returns;
  ShippingOptionsClient? _shippingOptions;
  StoreCreditAccountsClient? _storeCreditAccounts;
  AdminAuthClient? _adminAuth;
  AdminOrdersClient? _adminOrders;
  AdminProductsClient? _adminProducts;
  AdminStockLocationsClient? _adminStockLocations;
  AssemblyClient? _assembly;
  LogisticsClient? _logistics;
  CatalogClient? _catalog;
  ReviewsClient? _reviews;
  AssistantClient? _assistant;
  BonusClient? _bonus;
  PaymentClient? _payment;
  CompaniesClient? _companies;
  DocumentsClient? _documents;
  EstimatorClient? _estimator;

  AuthClient get auth => _auth ??= AuthClient(_dio, baseUrl: _baseUrl);

  MultiFactorAuthenticationMfaFactorsClient
  get multiFactorAuthenticationMfaFactors =>
      _multiFactorAuthenticationMfaFactors ??=
          MultiFactorAuthenticationMfaFactorsClient(_dio, baseUrl: _baseUrl);

  CartsClient get carts => _carts ??= CartsClient(_dio, baseUrl: _baseUrl);

  CollectionsClient get collections =>
      _collections ??= CollectionsClient(_dio, baseUrl: _baseUrl);

  CurrenciesClient get currencies =>
      _currencies ??= CurrenciesClient(_dio, baseUrl: _baseUrl);

  CustomersClient get customers =>
      _customers ??= CustomersClient(_dio, baseUrl: _baseUrl);

  GiftCardsClient get giftCards =>
      _giftCards ??= GiftCardsClient(_dio, baseUrl: _baseUrl);

  LocalesClient get locales =>
      _locales ??= LocalesClient(_dio, baseUrl: _baseUrl);

  OrdersClient get orders => _orders ??= OrdersClient(_dio, baseUrl: _baseUrl);

  PaymentCollectionsClient get paymentCollections =>
      _paymentCollections ??= PaymentCollectionsClient(_dio, baseUrl: _baseUrl);

  PaymentProvidersClient get paymentProviders =>
      _paymentProviders ??= PaymentProvidersClient(_dio, baseUrl: _baseUrl);

  ProductCategoriesClient get productCategories =>
      _productCategories ??= ProductCategoriesClient(_dio, baseUrl: _baseUrl);

  ProductOptionsClient get productOptions =>
      _productOptions ??= ProductOptionsClient(_dio, baseUrl: _baseUrl);

  ProductTagsClient get productTags =>
      _productTags ??= ProductTagsClient(_dio, baseUrl: _baseUrl);

  ProductTypesClient get productTypes =>
      _productTypes ??= ProductTypesClient(_dio, baseUrl: _baseUrl);

  ProductVariantsClient get productVariants =>
      _productVariants ??= ProductVariantsClient(_dio, baseUrl: _baseUrl);

  ProductsClient get products =>
      _products ??= ProductsClient(_dio, baseUrl: _baseUrl);

  RegionsClient get regions =>
      _regions ??= RegionsClient(_dio, baseUrl: _baseUrl);

  ReturnReasonsClient get returnReasons =>
      _returnReasons ??= ReturnReasonsClient(_dio, baseUrl: _baseUrl);

  ReturnsClient get returns =>
      _returns ??= ReturnsClient(_dio, baseUrl: _baseUrl);

  ShippingOptionsClient get shippingOptions =>
      _shippingOptions ??= ShippingOptionsClient(_dio, baseUrl: _baseUrl);

  StoreCreditAccountsClient get storeCreditAccounts => _storeCreditAccounts ??=
      StoreCreditAccountsClient(_dio, baseUrl: _baseUrl);

  AdminAuthClient get adminAuth =>
      _adminAuth ??= AdminAuthClient(_dio, baseUrl: _baseUrl);

  AdminOrdersClient get adminOrders =>
      _adminOrders ??= AdminOrdersClient(_dio, baseUrl: _baseUrl);

  AdminProductsClient get adminProducts =>
      _adminProducts ??= AdminProductsClient(_dio, baseUrl: _baseUrl);

  AdminStockLocationsClient get adminStockLocations => _adminStockLocations ??=
      AdminStockLocationsClient(_dio, baseUrl: _baseUrl);

  AssemblyClient get assembly =>
      _assembly ??= AssemblyClient(_dio, baseUrl: _baseUrl);

  LogisticsClient get logistics =>
      _logistics ??= LogisticsClient(_dio, baseUrl: _baseUrl);

  CatalogClient get catalog =>
      _catalog ??= CatalogClient(_dio, baseUrl: _baseUrl);

  ReviewsClient get reviews =>
      _reviews ??= ReviewsClient(_dio, baseUrl: _baseUrl);

  AssistantClient get assistant =>
      _assistant ??= AssistantClient(_dio, baseUrl: _baseUrl);

  BonusClient get bonus => _bonus ??= BonusClient(_dio, baseUrl: _baseUrl);

  PaymentClient get payment =>
      _payment ??= PaymentClient(_dio, baseUrl: _baseUrl);

  CompaniesClient get companies =>
      _companies ??= CompaniesClient(_dio, baseUrl: _baseUrl);

  DocumentsClient get documents =>
      _documents ??= DocumentsClient(_dio, baseUrl: _baseUrl);

  EstimatorClient get estimator =>
      _estimator ??= EstimatorClient(_dio, baseUrl: _baseUrl);
}
