import { api } from '../api/client';
import { standardMaterials, standardLabors, standardRecipes } from '../data/standardLibrary';

/**
 * Bu modül, yapay zeka tarafından oluşturulan standart malzeme, 
 * işçilik ve reçete kütüphanesini sisteme asenkron olarak yükler.
 */
export async function seedStandardLibrary(onProgress) {
    try {
        console.log("Seeding started...");
        if (onProgress) onProgress("Malzemeler yükleniyor...");

        // 1. Malzemeleri Yükle
        const existingMaterials = await api.get('/materials/catalog');
        for (const mat of standardMaterials) {
            const exists = (existingMaterials || []).find(m => m.code === mat.code);
            if (!exists) {
                await api.post('/materials/catalog', mat);
            }
        }

        // 2. İşçilik Kategorilerini ve Kartlarını Yükle
        if (onProgress) onProgress("İşçilik kartları yükleniyor...");
        const existingCategoriesData = await api.get('/labor/categories');
        const categories = existingCategoriesData?.categories || [];

        const catMap = {};
        const requiredCategories = [...new Set(standardLabors.map(l => l.category_name))];

        for (const catName of requiredCategories) {
            let cat = categories.find(c => c.name === catName);
            if (!cat) {
                // Not: Kategori ekleme endpoint'i front-end de görünmüyor olabilir, 
                // ancak backend'de genellikle labor post içinde veya ayrı bir endpointte vardır.
                // Eğer yoksa varsayılan bir ID kullanılabilir veya labor post içinde handle edilebilir.
                // Burada mevcut kategorilere bakıyoruz.
            }
            catMap[catName] = cat?.id;
        }

        const existingLabors = await api.get('/labor');
        for (const lab of standardLabors) {
            const exists = (existingLabors || []).find(l => l.code === lab.code);
            if (!exists) {
                // Kategori ID'sini bul (yoksa ilk kategoriyi ver)
                const categoryId = catMap[lab.category_name] || (categories[0]?.id);
                await api.post('/labor', {
                    code: lab.code,
                    name: lab.name,
                    unit: lab.unit,
                    category_id: categoryId
                });
            }
        }

        // 3. Reçeteleri Yükle
        if (onProgress) onProgress("Reçeteler yükleniyor...");
        const updatedMaterials = await api.get('/materials/catalog');
        const updatedLabors = await api.get('/labor');
        const existingRecipes = await api.get('/recipes');

        for (const rec of standardRecipes) {
            const exists = (existingRecipes || []).find(r => r.code === rec.code);
            if (!exists) {
                // Bileşenleri ID'ye dönüştür
                const recipeMaterials = rec.materials.map(rm => {
                    const mat = updatedMaterials.find(m => m.code === rm.material_code);
                    return mat ? { material_id: mat.id, quantity: rm.quantity } : null;
                }).filter(Boolean);

                const recipeLabors = rec.labors.map(rl => {
                    const lab = updatedLabors.find(l => l.code === rl.labor_code);
                    return lab ? { labor_id: lab.id, quantity: rl.quantity } : null;
                }).filter(Boolean);

                await api.post('/recipes', {
                    code: rec.code,
                    name: rec.name,
                    description: rec.description,
                    base_unit: rec.base_unit,
                    recipe_materials: recipeMaterials,
                    recipe_labors: recipeLabors
                });
            }
        }

        if (onProgress) onProgress("Tamamlandı!");
        return { success: true };
    } catch (error) {
        console.error("Seeding error:", error);
        throw error;
    }
}
