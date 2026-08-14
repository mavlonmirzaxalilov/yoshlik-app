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
