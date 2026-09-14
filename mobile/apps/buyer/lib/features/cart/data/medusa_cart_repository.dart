import 'package:api_client/api_client.dart'
    show
        MedusaStoreApi,
        StoreCart,
        StoreCartLineItem,
        StoreCartsIdLineItemsLineIdRequestBody,
        StoreCartsIdLineItemsRequestBody,
        StoreCartsRequestBody;

import '../../../shared/region_resolver.dart';
import '../domain/cart.dart';
import '../domain/cart_line.dart';
import 'cart_repository.dart';

/// Реализация [CartRepository] поверх Medusa Store API. Создаёт корзину в
/// контексте региона KZ (резолв делегирован общему [RegionResolver]), выполняет
/// мутации строк и превращает DTO корзины в презентационную модель [Cart].
class MedusaCartRepository implements CartRepository {
  MedusaCartRepository(this._api, this._publishableKey, this._regionResolver);

  final MedusaStoreApi _api;
  final String _publishableKey;
  final RegionResolver _regionResolver;

  @override
  Future<Cart> createCart() async {
    final regionId = await _regionResolver.resolveRegionId();
    final response = await _api.carts.postCarts(
      xPublishableApiKey: _publishableKey,
      body: StoreCartsRequestBody(regionId: regionId),
    );
    return _toCart(response.cart);
  }

  @override
  Future<Cart> fetchCart(String cartId) async {
    final response = await _api.carts.getCartsId(
      id: cartId,
      xPublishableApiKey: _publishableKey,
    );
    return _toCart(response.cart);
  }

  @override
  Future<Cart?> fetchMyCart() async {
    final response = await _api.carts.storeGetMyCart(
      xPublishableApiKey: _publishableKey,
    );
    final cartId = response.cartId;
    if (cartId == null || cartId.isEmpty) return null;
    return fetchCart(cartId);
  }

  @override
  Future<Cart> addLineItem({
    required String cartId,
    required String variantId,
    int quantity = 1,
  }) async {
    final response = await _api.carts.postCartsIdLineItems(
      id: cartId,
      xPublishableApiKey: _publishableKey,
      body: StoreCartsIdLineItemsRequestBody(
        variantId: variantId,
        quantity: quantity,
      ),
    );
    return _toCart(response.cart);
  }

  @override
  Future<Cart> updateLineItem({
    required String cartId,
    required String lineId,
    required int quantity,
  }) async {
    final response = await _api.carts.postCartsIdLineItemsLineId(
      id: cartId,
      lineId: lineId,
      xPublishableApiKey: _publishableKey,
      body: StoreCartsIdLineItemsLineIdRequestBody(quantity: quantity),
    );
    return _toCart(response.cart);
  }

  @override
  Future<Cart> removeLineItem({
    required String cartId,
    required String lineId,
  }) async {
    final response = await _api.carts.deleteCartsIdLineItemsLineId(
      id: cartId,
      lineId: lineId,
      xPublishableApiKey: _publishableKey,
    );
    // Ответ удаления несёт обновлённую корзину в `parent`; при её отсутствии —
    // перечитываем корзину явным запросом.
    final parent = response.parent;
    return parent != null ? _toCart(parent) : fetchCart(cartId);
  }

  Cart _toCart(StoreCart cart) {
    // Сортируем строки по id — стабильный порядок между мутациями (иначе
    // бэкенд может вернуть строки в другом порядке и список «прыгнет»).
    final items = [...?cart.items]..sort((a, b) => a.id.compareTo(b.id));
    return Cart(
      id: cart.id,
      currencyCode: cart.currencyCode,
      total: cart.total,
      lines: items.map((item) => _toCartLine(item, cart.currencyCode)).toList(),
    );
  }

  CartLine _toCartLine(StoreCartLineItem item, String currencyCode) {
    final thumbnail = item.thumbnail;
    return CartLine(
      id: item.id,
      title: item.productTitle ?? item.title,
      variantTitle: item.variantTitle,
      thumbnailUrl: (thumbnail == null || thumbnail.isEmpty) ? null : thumbnail,
      quantity: item.quantity.toInt(),
      unitPrice: item.unitPrice,
      currencyCode: currencyCode,
    );
  }
}
