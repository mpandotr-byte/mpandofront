export const standardMaterials = [
    { code: 'MAT-001', name: 'Hazır Beton C30/37', category: 'Kaba', unit: 'm³', width_cm: 0, length_cm: 0, thickness_mm: 0, weight_per_unit: 2400, pallet_content_m2: 0, pallet_box_count: 0, lead_time_days: 1 },
    { code: 'MAT-002', name: 'Nervürlü İnşaat Demiri (Q12)', category: 'Kaba', unit: 'kg', width_cm: 1200, length_cm: 1.2, thickness_mm: 12, weight_per_unit: 0.888, pallet_content_m2: 0, pallet_box_count: 0, lead_time_days: 2 },
    { code: 'MAT-003', name: 'Tuğla (13.5 x 19 x 19)', category: 'Kaba', unit: 'Adet', width_cm: 13.5, length_cm: 19, thickness_mm: 190, weight_per_unit: 2.2, pallet_content_m2: 0, pallet_box_count: 0, lead_time_days: 3 },
    { code: 'MAT-004', name: 'Portland Çimento (Torba - 50kg)', category: 'Kaba', unit: 'Adet', width_cm: 40, length_cm: 60, thickness_mm: 15, weight_per_unit: 50, pallet_content_m2: 0, pallet_box_count: 0, lead_time_days: 1 },
    { code: 'MAT-005', name: 'Kaba Kum (Elenmiş)', category: 'Kaba', unit: 'm³', width_cm: 0, length_cm: 0, thickness_mm: 0, weight_per_unit: 1600, pallet_content_m2: 0, pallet_box_count: 0, lead_time_days: 1 },
    { code: 'MAT-006', name: 'Seramik (60x60 - Antrasit)', category: 'İnce', unit: 'm²', width_cm: 60, length_cm: 60, thickness_mm: 10, weight_per_unit: 15, pallet_content_m2: 1.44, pallet_box_count: 4, lead_time_days: 7 },
    { code: 'MAT-007', name: 'İç Cephe Boyası (Saten)', category: 'İnce', unit: 'kg', width_cm: 30, length_cm: 30, thickness_mm: 0, weight_per_unit: 20, pallet_content_m2: 0, pallet_box_count: 0, lead_time_days: 2 },
    { code: 'MAT-008', name: 'Alçı Sıva (Perlitli - 35kg)', category: 'İnce', unit: 'Adet', width_cm: 40, length_cm: 65, thickness_mm: 0, weight_per_unit: 35, pallet_content_m2: 0, pallet_box_count: 0, lead_time_days: 2 },
    { code: 'MAT-009', name: 'Elektrik Kablosu (3x2.5 NYM)', category: 'Elektrik', unit: 'mt', width_cm: 0, length_cm: 0, thickness_mm: 10, weight_per_unit: 0.15, pallet_content_m2: 0, pallet_box_count: 0, lead_time_days: 3 },
    { code: 'MAT-010', name: 'PPRC Boru (DN25)', category: 'Mekanik', unit: 'mt', width_cm: 0, length_cm: 4, thickness_mm: 25, weight_per_unit: 0.3, pallet_content_m2: 0, pallet_box_count: 0, lead_time_days: 3 },
    { code: 'MAT-011', name: 'Laminat Parke (8mm - Meşe)', category: 'İnce', unit: 'm²', width_cm: 19.5, length_cm: 120, thickness_mm: 8, weight_per_unit: 7, pallet_content_m2: 2.1, pallet_box_count: 8, lead_time_days: 5 },
    { code: 'MAT-012', name: 'Panel Oda Kapısı (Lake Beyaz)', category: 'Mobilya', unit: 'Adet', width_cm: 80, length_cm: 210, thickness_mm: 40, weight_per_unit: 25, pallet_content_m2: 1, pallet_box_count: 1, lead_time_days: 15 }
];

export const standardLabors = [
    { code: 'LAB-001', name: 'Kalıp İşçiliği', category_name: 'Kaba İnşaat', unit: 'm²' },
    { code: 'LAB-002', name: 'Demir İşçiliği', category_name: 'Kaba İnşaat', unit: 'kg' },
    { code: 'LAB-003', name: 'Beton Dökümü İşçiliği', category_name: 'Kaba İnşaat', unit: 'm³' },
    { code: 'LAB-004', name: 'Tuğla Örme İşçiliği', category_name: 'Kaba İnşaat', unit: 'm²' },
    { code: 'LAB-005', name: 'Alçı Sıva İşçiliği', category_name: 'İnce İnşaat', unit: 'm²' },
    { code: 'LAB-006', name: 'Boya İşçiliği', category_name: 'İnce İnşaat', unit: 'm²' },
    { code: 'LAB-007', name: 'Seramik Döşeme İşçiliği', category_name: 'İnce İnşaat', unit: 'm²' },
    { code: 'LAB-008', name: 'Elektrik Tesisat İşçiliği', category_name: 'Elektrik', unit: 'Adet' },
    { code: 'LAB-009', name: 'Sıhhi Tesisat İşçiliği', category_name: 'Mekanik', unit: 'Adet' },
    { code: 'LAB-010', name: 'Parke Döşeme İşçiliği', category_name: 'İnce İnşaat', unit: 'm²' }
];

export const standardRecipes = [
    {
        code: 'REC-001',
        name: 'Betonarme Kolon İmalatı (C30)',
        description: 'C30 beton, donatı ve kalıp dahil komple kolon imalatı',
        base_unit: 'm³',
        materials: [
            { material_code: 'MAT-001', quantity: 1.05 }, // Beton
            { material_code: 'MAT-002', quantity: 120 },  // Demir (ortalama 120kg/m3)
            { material_code: 'MAT-004', quantity: 2 }      // Ekstra çimento
        ],
        labors: [
            { labor_code: 'LAB-001', quantity: 12 },   // Kalıp (ortalama 12m2/m3)
            { labor_code: 'LAB-002', quantity: 120 },  // Demir
            { labor_code: 'LAB-003', quantity: 1 }     // Beton döküm
        ]
    },
    {
        code: 'REC-002',
        name: 'Tuğla Duvar İmalatı (20cm)',
        description: '13.5 tuğla ile harçlı duvar örümü',
        base_unit: 'm²',
        materials: [
            { material_code: 'MAT-003', quantity: 26 }, // Tuğla (26 adet/m2)
            { material_code: 'MAT-004', quantity: 0.15 }, // Çimento
            { material_code: 'MAT-005', quantity: 0.05 }  // Kum
        ],
        labors: [
            { labor_code: 'LAB-004', quantity: 1 }
        ]
    },
    {
        code: 'REC-003',
        name: 'Seramik Yer Kaplaması',
        description: 'Yapıştırma harcı dahil seramik döşeme',
        base_unit: 'm²',
        materials: [
            { material_code: 'MAT-006', quantity: 1.05 }, // Seramik (+fire)
            { material_code: 'MAT-004', quantity: 0.1 }   // Yapıştırıcı (çimento bazlı)
        ],
        labors: [
            { labor_code: 'LAB-007', quantity: 1 }
        ]
    },
    {
        code: 'REC-004',
        name: 'Saten Boya Uygulaması (3 Kat)',
        description: 'Astar ve 2 kat boya uygulaması',
        base_unit: 'm²',
        materials: [
            { material_code: 'MAT-007', quantity: 0.4 }, // Boya
            { material_code: 'MAT-008', quantity: 0.1 }  // Alçı tashihi
        ],
        labors: [
            { labor_code: 'LAB-006', quantity: 1 }
        ]
    }
];
