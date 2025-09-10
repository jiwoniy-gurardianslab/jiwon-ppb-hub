# PPB

## Create
[Get Started](https://www.prisma.io/docs/getting-started/quickstart-sqlite)
```
pnpm dlx install prisma -D
// 설치할때 onlyBuiltDependencies warning 발생
pnpm dlx init --datasource-provicer postgresql --output ../generated/prisma
```

### ppb database introspec(개발 데이터베이스)
실행
```
prisma db pull --schema=prisma/ppb/schema.prisma
```
실행결과
```
Environment variables loaded from .env
Prisma schema loaded from prisma/ppb/schema.prisma
Datasource "db": PostgreSQL database "ppb-development", schema "public" at "ppb-development.cohpkveydrp3.ap-northeast-2.rds.amazonaws.com:5432"

✔ Introspected 160 models and wrote them into prisma/ppb/schema.prisma in 1.43s
      
*** WARNING ***

The following models were ignored as they do not have a valid unique identifier or id. This is currently not supported by Prisma Client:
  - "awsdms_apply_exceptions"
  - "awsdms_validation_failures_v1"
  - "franchise_kind"
  - "issue_hapakr_coupons"
  - "raw_records"
  - "settings2"
  - "settings3"
  - "tmp_hapa_jp"

These objects have comments defined in the database, which is not yet fully supported. Read more: https://pris.ly/d/database-comments
  - Type: "field", name: "ppb_orders.is_in_franchise_stock"
  - Type: "field", name: "ppb_orders.shipping_order_id"
  - Type: "field", name: "ppb_orders.franchise_prepared_at"
  - Type: "field", name: "ppb_referral_rankings.user_id"
  - Type: "field", name: "ppb_referral_rankings.nick_name"
  - Type: "field", name: "ppb_referral_rankings.referral_code"
  - Type: "field", name: "ppb_referral_rankings.invite_count"
  - Type: "field", name: "ppb_referral_rankings.last_invite_at"

```

### 권장사항
1. Database 컬럼은 snake_case지만 어플리케이션에서 camelCase로 사용(schema에서 변환해줌)