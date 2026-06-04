-- CreateTable
CREATE TABLE "service_images" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "service_id" TEXT NOT NULL,
    "document_id" TEXT,
    "description" TEXT,
    "order" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "service_images_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "service_images_document_id_key" ON "service_images"("document_id");

-- CreateIndex
CREATE INDEX "service_images_service_id_order_idx" ON "service_images"("service_id", "order");

-- AddForeignKey
ALTER TABLE "service_images" ADD CONSTRAINT "service_images_service_id_fkey" FOREIGN KEY ("service_id") REFERENCES "services"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_images" ADD CONSTRAINT "service_images_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_images" ADD CONSTRAINT "service_images_document_id_fkey" FOREIGN KEY ("document_id") REFERENCES "documents"("id") ON DELETE SET NULL ON UPDATE CASCADE;
