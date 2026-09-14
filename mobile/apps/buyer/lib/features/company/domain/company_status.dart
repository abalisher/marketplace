/// Статус модерации заявки юрлица. Значения приходят из контракта
/// (`StoreCompanyStatus`); неизвестный код — [unknown], чтобы новый статус
/// бэкенда не ронял экран.
enum CompanyStatus { pending, approved, rejected, unknown }
