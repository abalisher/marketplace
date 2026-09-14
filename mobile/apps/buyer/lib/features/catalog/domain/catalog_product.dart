/// Товар в списке каталога — тонкая презентационная модель. Собирается из
/// ответа Store API в репозитории; экран/виджеты знают только о ней, а не о
/// сгенерированных DTO. Цена приходит из бэкенда рассчитанной (клиент ничего
/// не считает — бизнес-логика только на сервере).
class CatalogProduct {
  const CatalogProduct({
    required this.id,
    required this.title,
    this.thumbnailUrl,
    this.priceAmount,
    this.currencyCode,
  });

  /// Идентификатор товара.
  final String id;

  /// Название товара.
  final String title;

  /// URL миниатюры; null — если у товара её нет.
  final String? thumbnailUrl;

  /// Рассчитанная бэкендом цена в единицах валюты; null — если цены нет
  /// (например, не передан регион или у варианта нет прайса).
  final num? priceAmount;

  /// Код валюты цены (например, `kzt`); null — если цены нет.
  final String? currencyCode;
}
