-- Anon (public) foydalanuvchilarga categories/products'ni o'qishga ruxsat berish
-- Supabase Dashboard > SQL Editor'ga joylab ishga tushiring

alter table categories enable row level security;
alter table products enable row level security;

create policy "Public categories o'qish"
  on categories for select
  to anon
  using (true);

create policy "Public products o'qish"
  on products for select
  to anon
  using (true);

-- Mini App'dan (anon) buyurtma yozish uchun ruxsatlar
alter table orders enable row level security;
alter table order_items enable row level security;
alter table bot_users enable row level security;

create policy "Public orders yozish"
  on orders for insert
  to anon
  with check (true);

create policy "Public orders o'zini o'qish"
  on orders for select
  to anon
  using (true);

create policy "Public order_items yozish"
  on order_items for insert
  to anon
  with check (true);

create policy "Public bot_users o'qish"
  on bot_users for select
  to anon
  using (true);
