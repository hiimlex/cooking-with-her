-- AddIndex: User.coupleId
CREATE INDEX "User_coupleId_idx" ON "User"("coupleId");

-- AddIndex: Recipe.byId / tag / favorite / cookedCount
CREATE INDEX "Recipe_byId_idx" ON "Recipe"("byId");
CREATE INDEX "Recipe_tag_idx" ON "Recipe"("tag");
CREATE INDEX "Recipe_favorite_idx" ON "Recipe"("favorite");
CREATE INDEX "Recipe_cookedCount_idx" ON "Recipe"("cookedCount");

-- AddIndex: Ingredient.cat / expiry
CREATE INDEX "Ingredient_cat_idx" ON "Ingredient"("cat");
CREATE INDEX "Ingredient_expiry_idx" ON "Ingredient"("expiry");

-- AddIndex: ShoppingEntry.done / byId
CREATE INDEX "ShoppingEntry_done_idx" ON "ShoppingEntry"("done");
CREATE INDEX "ShoppingEntry_byId_idx" ON "ShoppingEntry"("byId");

-- AddIndex: HistoryEntry.byId / recipeId / mealType / cookedAt
CREATE INDEX "HistoryEntry_byId_idx" ON "HistoryEntry"("byId");
CREATE INDEX "HistoryEntry_recipeId_idx" ON "HistoryEntry"("recipeId");
CREATE INDEX "HistoryEntry_mealType_idx" ON "HistoryEntry"("mealType");
CREATE INDEX "HistoryEntry_cookedAt_idx" ON "HistoryEntry"("cookedAt");

-- AddIndex: OrderEntry.coupleId / date
CREATE INDEX "OrderEntry_coupleId_idx" ON "OrderEntry"("coupleId");
CREATE INDEX "OrderEntry_date_idx" ON "OrderEntry"("date");

-- AddIndex: Memory.byId / recipeId / date
CREATE INDEX "Memory_byId_idx" ON "Memory"("byId");
CREATE INDEX "Memory_recipeId_idx" ON "Memory"("recipeId");
CREATE INDEX "Memory_date_idx" ON "Memory"("date");
