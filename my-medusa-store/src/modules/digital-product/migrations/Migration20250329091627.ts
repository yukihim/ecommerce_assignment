import { Migration } from '@mikro-orm/migrations';

export class Migration20250329091627 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "digital_product" add column if not exists "duration" integer not null default 1;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table if exists "digital_product" drop column if exists "duration";`);
  }

}
