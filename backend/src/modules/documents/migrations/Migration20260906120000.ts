import { Migration } from "@medusajs/framework/mikro-orm/migrations";

// Бланки документов приведены к казахстанским формам: счёт юрлицу печатает
// рамку «образец платёжного поручения», а без Кбе и КНП банк покупателя платёж
// по такому счёту не проведёт. Руководитель нужен для расшифровки подписи под
// счётом и актом. Дефолты — типовые для ТОО-резидента (Кбе 17) и оплаты за
// товар (КНП 710), чтобы стенд и существующая строка настроек не остались
// пустыми.
export class Migration20260906120000 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "document_setting" add column if not exists "seller_kbe" text not null default '17';`);
    this.addSql(`alter table if exists "document_setting" add column if not exists "seller_knp" text not null default '710';`);
    this.addSql(`alter table if exists "document_setting" add column if not exists "director_name" text null;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table if exists "document_setting" drop column if exists "seller_kbe";`);
    this.addSql(`alter table if exists "document_setting" drop column if exists "seller_knp";`);
    this.addSql(`alter table if exists "document_setting" drop column if exists "director_name";`);
  }

}
