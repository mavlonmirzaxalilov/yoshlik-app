-- Yoshlik Kafe uchun test ma'lumotlari
-- Supabase Dashboard > SQL Editor'ga joylab ishga tushiring

insert into categories (name, sort_order, is_active) values
  ('Fastfud', 1, true),
  ('Pitsalar', 2, true),
  ('Ichimliklar', 3, true),
  ('Desertlar', 4, true);

insert into products (category_id, name, description, price, image_url, is_available, sort_order)
select c.id, p.name, p.description, p.price, p.image_url, true, p.sort_order
from (values
  ('Fastfud', 'Chizburger', 'Mol go''shti, pishloq, pomidor, salat', 28000, null, 1),
  ('Fastfud', 'Hot-dog', 'Sosiska, sous, ko''katlar', 20000, null, 2),
  ('Fastfud', 'Kartoshka fri', 'Xrustli kartoshka fri, sous bilan', 15000, null, 3),
  ('Pitsalar', 'Margarita', 'Pomidor sousi, mozzarella, rayhon', 45000, null, 1),
  ('Pitsalar', 'Peperoni', 'Pomidor sousi, mozzarella, peperoni', 52000, null, 2),
  ('Ichimliklar', 'Coca-Cola 0.5L', 'Sovutilgan', 8000, null, 1),
  ('Ichimliklar', 'Limonad', 'Uy sharoitida tayyorlangan', 12000, null, 2),
  ('Desertlar', 'Tiramisu', 'Klassik italyan deserti', 25000, null, 1)
) as p(category_name, name, description, price, image_url, sort_order)
join categories c on c.name = p.category_name;
