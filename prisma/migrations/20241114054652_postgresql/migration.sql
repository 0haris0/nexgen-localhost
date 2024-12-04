-- CreateEnum
CREATE TYPE "shops_status" AS ENUM ('ACTIVE', 'INACTIVE', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "shops_preferred_contact_method" AS ENUM ('EMAIL', 'PHONE', 'NONE');

-- CreateEnum
CREATE TYPE "payments_subscription_plan" AS ENUM ('basic', 'professional', 'advanced', 'enterprise');

-- CreateEnum
CREATE TYPE "payments_payment_status" AS ENUM ('paid', 'pending', 'failed', 'refunded');

-- CreateEnum
CREATE TYPE "payments_payment_method" AS ENUM ('credit_card', 'paypal', 'bank_transfer', 'shopify_billing');

-- CreateEnum
CREATE TYPE "products_status" AS ENUM ('new', 'processed', 'updated', 'skipped', 'archived');

-- CreateTable
CREATE TABLE "payments" (
    "id" SERIAL NOT NULL,
    "shop_id" INTEGER,
    "subscription_plan" "payments_subscription_plan" NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "currency" VARCHAR(10) DEFAULT 'USD',
    "payment_date" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "next_payment_date" TIMESTAMP(3),
    "payment_status" "payments_payment_status" DEFAULT 'paid',
    "payment_method" "payments_payment_method",
    "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "notes" TEXT,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "issues" (
    "id" SERIAL NOT NULL,
    "shop_id" INTEGER,
    "product_id" INTEGER NOT NULL,
    "shopify_product_id" TEXT NOT NULL,
    "issuesCount" JSONB,

    CONSTRAINT "issues_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product" (
    "id" SERIAL NOT NULL,
    "shopify_id" TEXT NOT NULL,
    "shop_id" INTEGER,
    "title" TEXT,
    "description" TEXT,
    "seo_title" TEXT,
    "seo_description" TEXT,
    "date_created" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "last_checked" TIMESTAMP(3),
    "product_status" "products_status" DEFAULT 'new',
    "feedback" JSONB,
    "issuesCategories" JSONB,
    "feedback_issues" INTEGER,
    "ai_correction" BOOLEAN DEFAULT false,
    "previous_data" JSONB,
    "updated_by" TEXT,
    "handle" TEXT,
    "category_id" TEXT,
    "category_name" TEXT,
    "tags" JSONB,
    "product_type" TEXT,
    "featured_image" JSONB,

    CONSTRAINT "product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "productHistory" (
    "id" SERIAL NOT NULL,
    "product_id" INTEGER NOT NULL,
    "shopify_id" TEXT NOT NULL,
    "shop_id" INTEGER,
    "title" TEXT,
    "description" TEXT,
    "seo_title" TEXT,
    "seo_description" TEXT,
    "date_created" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "last_checked" TIMESTAMP(3),
    "product_status" "products_status" DEFAULT 'new',
    "feedback" JSONB,
    "issuesCategories" JSONB,
    "feedback_issues" INTEGER,
    "ai_correction" BOOLEAN DEFAULT false,
    "updated_by" JSONB,
    "handle" TEXT,
    "category_id" TEXT,
    "category_name" TEXT,
    "tags" JSONB,
    "product_type" TEXT,
    "featured_image" JSONB,
    "newTitle" TEXT,
    "newDescription" TEXT,
    "newTags" JSONB,
    "newSeoTitle" TEXT,
    "newCategoryName" TEXT,
    "newProductType" TEXT,
    "newSeoDescription" TEXT,

    CONSTRAINT "productHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "shops" (
    "id" SERIAL NOT NULL,
    "shopify_shop_id" TEXT NOT NULL,
    "shop_name" TEXT NOT NULL,
    "owner_name" TEXT,
    "email" TEXT,
    "planId" INTEGER NOT NULL,
    "api_access_token" TEXT,
    "store_currency" TEXT,
    "store_locale" TEXT,
    "date_added" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "last_sync" TIMESTAMP(3),
    "status" "shops_status" DEFAULT 'ACTIVE',
    "notes" TEXT,
    "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "shop_url" TEXT,
    "total_products" INTEGER DEFAULT 0,
    "country" TEXT,
    "timezone" TEXT,
    "subscription_renewal_date" TIMESTAMP(3),
    "preferred_contact_method" "shops_preferred_contact_method",
    "phone" TEXT,
    "credit" INTEGER NOT NULL DEFAULT 100,

    CONSTRAINT "shops_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Plan" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "description" TEXT,
    "productNumber" INTEGER NOT NULL DEFAULT 3,
    "credits" INTEGER NOT NULL DEFAULT 100,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Plan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "session" (
    "id" TEXT NOT NULL,
    "shop" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "isOnline" BOOLEAN NOT NULL DEFAULT false,
    "scope" TEXT,
    "expires" TIMESTAMP(3),
    "accessToken" TEXT NOT NULL,
    "userId" BIGINT,
    "firstName" TEXT,
    "lastName" TEXT,
    "email" TEXT,
    "accountOwner" BOOLEAN NOT NULL DEFAULT false,
    "locale" TEXT,
    "collaborator" BOOLEAN DEFAULT false,
    "emailVerified" BOOLEAN DEFAULT false,

    CONSTRAINT "session_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "payments_shop_id_index" ON "payments"("shop_id");

-- CreateIndex
CREATE UNIQUE INDEX "issues_product_id_key" ON "issues"("product_id");

-- CreateIndex
CREATE UNIQUE INDEX "issues_shopify_product_id_key" ON "issues"("shopify_product_id");

-- CreateIndex
CREATE UNIQUE INDEX "product_shopify_id_key" ON "product"("shopify_id");

-- CreateIndex
CREATE INDEX "products_shop_id_index" ON "product"("shop_id");

-- CreateIndex
CREATE INDEX "productHistory_product_id_index" ON "productHistory"("product_id");

-- CreateIndex
CREATE UNIQUE INDEX "shops_shopify_shop_id_key" ON "shops"("shopify_shop_id");

-- CreateIndex
CREATE INDEX "shops_shopify_shop_id_index" ON "shops"("shopify_shop_id");

-- CreateIndex
CREATE INDEX "shops_email_index" ON "shops"("email");

-- CreateIndex
CREATE INDEX "shops_shop_url_index" ON "shops"("shop_url");

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_ibfk_1" FOREIGN KEY ("shop_id") REFERENCES "shops"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "issues" ADD CONSTRAINT "issues_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product" ADD CONSTRAINT "products_ibfk_1" FOREIGN KEY ("shop_id") REFERENCES "shops"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "productHistory" ADD CONSTRAINT "productHistory_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shops" ADD CONSTRAINT "shops_planId_fkey" FOREIGN KEY ("planId") REFERENCES "Plan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
