-- =========================================================================
-- Clocky seed (Sunday-first weeks):
--   week_start = '2026-07-13' (Sunday) → 2026-07-19 (Saturday)
--   days JSONB keys (ISO): 0=Dom, 1=Lun, 2=Mar, 3=Mié, 4=Jue, 5=Vie, 6=Sáb
--
-- Idempotent: safe to re-run.
-- =========================================================================

-- 1) Remove any legacy schedules (Monday-start anchor).
delete from schedules where week_start = '2026-07-06';

-- 2) Insert 9 weekly schedules for the Sunday-first week.
insert into schedules (staff_id, week_start, days) values
  -- 1) Simón Amaya — Dom Descanso; Lun-Vie 06:00-15:00; Sáb 06:00-10:00
  ('11111111-1111-1111-1111-000000000001', '2026-07-13',
    '{"0":{"type":"rest"},"1":{"type":"time","start":"06:00","end":"15:00"},"2":{"type":"time","start":"06:00","end":"15:00"},"3":{"type":"time","start":"06:00","end":"15:00"},"4":{"type":"time","start":"06:00","end":"15:00"},"5":{"type":"time","start":"06:00","end":"15:00"},"6":{"type":"time","start":"06:00","end":"10:00"}}'::jsonb),

  -- 2) Aníbal Fuentes — Dom Disponible; Lun-Vie 08:00-17:00; Sáb 08:00-12:00
  ('11111111-1111-1111-1111-000000000002', '2026-07-13',
    '{"0":{"type":"available"},"1":{"type":"time","start":"08:00","end":"17:00"},"2":{"type":"time","start":"08:00","end":"17:00"},"3":{"type":"time","start":"08:00","end":"17:00"},"4":{"type":"time","start":"08:00","end":"17:00"},"5":{"type":"time","start":"08:00","end":"17:00"},"6":{"type":"time","start":"08:00","end":"12:00"}}'::jsonb),

  -- 3) Dina Escobar — Dom 22:00-05:00; Lun 22:00-05:00; Mar 22:00-06:00; Mié amanece; Jue 07:00-17:00; Vie 07:00-17:00; Sáb 07:00-23:00
  ('11111111-1111-1111-1111-000000000003', '2026-07-13',
    '{"0":{"type":"time","start":"22:00","end":"05:00"},"1":{"type":"time","start":"22:00","end":"05:00"},"2":{"type":"time","start":"22:00","end":"06:00"},"3":{"type":"nightIn"},"4":{"type":"time","start":"07:00","end":"17:00"},"5":{"type":"time","start":"07:00","end":"17:00"},"6":{"type":"time","start":"07:00","end":"23:00"}}'::jsonb),

  -- 4) Camilo Suárez — Dom 22:00-05:00; Lun 22:00-05:00; Mar 22:00-06:00; Mié 22:00-05:00; Jue 22:00-06:00; Vie 22:00-05:00; Sáb amanece
  ('11111111-1111-1111-1111-000000000004', '2026-07-13',
    '{"0":{"type":"time","start":"22:00","end":"05:00"},"1":{"type":"time","start":"22:00","end":"05:00"},"2":{"type":"time","start":"22:00","end":"06:00"},"3":{"type":"time","start":"22:00","end":"05:00"},"4":{"type":"time","start":"22:00","end":"06:00"},"5":{"type":"time","start":"22:00","end":"05:00"},"6":{"type":"nightIn"}}'::jsonb),

  -- 5) Angélica García — Dom Descanso; Lun-Vie 06:00-15:00; Sáb 06:00-10:00
  ('11111111-1111-1111-1111-000000000005', '2026-07-13',
    '{"0":{"type":"rest"},"1":{"type":"time","start":"06:00","end":"15:00"},"2":{"type":"time","start":"06:00","end":"15:00"},"3":{"type":"time","start":"06:00","end":"15:00"},"4":{"type":"time","start":"06:00","end":"15:00"},"5":{"type":"time","start":"06:00","end":"15:00"},"6":{"type":"time","start":"06:00","end":"10:00"}}'::jsonb),

  -- 6) Dallana Obando — Dom Descanso; Lun-Vie 08:00-17:00; Sáb 08:00-12:00
  ('11111111-1111-1111-1111-000000000006', '2026-07-13',
    '{"0":{"type":"rest"},"1":{"type":"time","start":"08:00","end":"17:00"},"2":{"type":"time","start":"08:00","end":"17:00"},"3":{"type":"time","start":"08:00","end":"17:00"},"4":{"type":"time","start":"08:00","end":"17:00"},"5":{"type":"time","start":"08:00","end":"17:00"},"6":{"type":"time","start":"08:00","end":"12:00"}}'::jsonb),

  -- 7) Kenin Pinilla — Dom Descanso; Lun-Vie 08:00-17:00; Sáb 08:00-12:00
  ('11111111-1111-1111-1111-000000000007', '2026-07-13',
    '{"0":{"type":"rest"},"1":{"type":"time","start":"08:00","end":"17:00"},"2":{"type":"time","start":"08:00","end":"17:00"},"3":{"type":"time","start":"08:00","end":"17:00"},"4":{"type":"time","start":"08:00","end":"17:00"},"5":{"type":"time","start":"08:00","end":"17:00"},"6":{"type":"time","start":"08:00","end":"12:00"}}'::jsonb),

  -- 8) Andrés Correa — Dom Descanso; Lun-Vie 07:00-16:00; Sáb 07:00-11:00
  ('11111111-1111-1111-1111-000000000008', '2026-07-13',
    '{"0":{"type":"rest"},"1":{"type":"time","start":"07:00","end":"16:00"},"2":{"type":"time","start":"07:00","end":"16:00"},"3":{"type":"time","start":"07:00","end":"16:00"},"4":{"type":"time","start":"07:00","end":"16:00"},"5":{"type":"time","start":"07:00","end":"16:00"},"6":{"type":"time","start":"07:00","end":"11:00"}}'::jsonb),

  -- 9) María Obeso — Dom Descanso; Lun-Vie 08:00-17:00; Sáb 08:00-12:00
  ('11111111-1111-1111-1111-000000000009', '2026-07-13',
    '{"0":{"type":"rest"},"1":{"type":"time","start":"08:00","end":"17:00"},"2":{"type":"time","start":"08:00","end":"17:00"},"3":{"type":"time","start":"08:00","end":"17:00"},"4":{"type":"time","start":"08:00","end":"17:00"},"5":{"type":"time","start":"08:00","end":"17:00"},"6":{"type":"time","start":"08:00","end":"12:00"}}'::jsonb)
on conflict (staff_id, week_start) do update set
  days = excluded.days,
  updated_at = now();