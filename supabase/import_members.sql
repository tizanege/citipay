-- =========================================================
-- CITIPAY: MEMBERS & PAYMENT DATA IMPORT FROM EXCEL
-- Source: Members payment.xlsx
-- 43 Members, Rosters, Payment Plans & Historical Records
-- =========================================================

BEGIN;

-- 0. ENSURE SUNDAY LEAGUE FC EXISTS
INSERT INTO public.clubs (
  id, name, slug, code, logo_url, primary_color, secondary_color, accent_color,
  stadium, city, founded_year, membership_fee, monthly_social_dues, max_installments
) VALUES (
  '11111111-1111-1111-1111-111111111111',
  'Sunday League FC',
  'sunday-league-fc',
  'SLFC',
  '/crests/sunday-league-fc.svg',
  '#2563EB',
  '#DC2626',
  '#FFFFFF',
  'Campos Memorial Mini Stadium, Lagos Island',
  'Lagos',
  2021,
  80000.00,
  5000.00,
  4
) ON CONFLICT (id) DO UPDATE SET membership_fee = 80000.00;


-- 1. INSERT PROFILES
INSERT INTO public.profiles (id, member_id, email, full_name, nickname, role, club_id, eligibility_status, account_status) VALUES
  ('e2ed7dd1-911e-444e-a843-aa2ee0738d19', 'SL-YY2A3', 'eko@sundayleaguefc.ng', 'Eko', 'Eko', 'member', '11111111-1111-1111-1111-111111111111', 'yellow', 'active'),
  ('10a54561-7ef5-4955-a2cb-225f90a0eb24', 'SL-DMK2K', 'afoo@sundayleaguefc.ng', 'Afoo', 'Afoo', 'member', '11111111-1111-1111-1111-111111111111', 'green', 'active'),
  ('23a7df9a-10a4-49ef-ae64-d69ab09c056e', 'SL-WC4PA', 'badmus@sundayleaguefc.ng', 'Badmus', 'Badmus', 'member', '11111111-1111-1111-1111-111111111111', 'green', 'active'),
  ('1875c436-e149-4880-a129-51962ff15003', 'SL-NNP9M', 'paige@sundayleaguefc.ng', 'Paige', 'Paige', 'member', '11111111-1111-1111-1111-111111111111', 'green', 'active'),
  ('f50d9317-53bf-443a-a95e-2816df3b1a6d', 'SL-RXVE8', 'lucky@sundayleaguefc.ng', 'Lucky', 'Lucky', 'member', '11111111-1111-1111-1111-111111111111', 'green', 'active'),
  ('2496b74c-a3a8-47b7-a783-9cb6b7a80b92', 'SL-28WT3', 'tope@sundayleaguefc.ng', 'Tope', 'Tope', 'member', '11111111-1111-1111-1111-111111111111', 'green', 'active'),
  ('caf84eca-0d66-4aab-a012-7db6bde57014', 'SL-P4BCA', 'kunle@sundayleaguefc.ng', 'Kunle', 'Kunle', 'member', '11111111-1111-1111-1111-111111111111', 'green', 'active'),
  ('b69a34a7-5f5b-4cdd-ad76-987c40df79a9', 'SL-FK2K3', 'ade@sundayleaguefc.ng', 'Ade', 'Ade', 'member', '11111111-1111-1111-1111-111111111111', 'green', 'active'),
  ('b496afde-6ed3-4fa6-aeab-c276d997d6a9', 'SL-9B2CY', 'junior@sundayleaguefc.ng', 'Junior', 'Junior', 'member', '11111111-1111-1111-1111-111111111111', 'yellow', 'active'),
  ('71a6c0a1-5c5e-4389-a818-1227919c7eb5', 'SL-VT69A', 'charles@sundayleaguefc.ng', 'Charles', 'Charles', 'member', '11111111-1111-1111-1111-111111111111', 'yellow', 'active'),
  ('5b1e1811-6125-4675-a922-303ded312071', 'SL-664U7', 'rado@sundayleaguefc.ng', 'Rado', 'Rado', 'member', '11111111-1111-1111-1111-111111111111', 'yellow', 'active'),
  ('815b2b57-afb7-479d-a293-6994ea44a842', 'SL-KC29V', 'bee@sundayleaguefc.ng', 'Bee', 'Bee', 'member', '11111111-1111-1111-1111-111111111111', 'yellow', 'active'),
  ('b29485c7-bf27-4a3c-aa9a-a56cef3c86da', 'SL-UKCAQ', 'mila@sundayleaguefc.ng', 'Mila', 'Mila', 'member', '11111111-1111-1111-1111-111111111111', 'green', 'active'),
  ('433beb18-466c-4a2c-a8b5-ebddcc796da7', 'SL-UWT35', 'femi@sundayleaguefc.ng', 'Femi', 'Femi', 'member', '11111111-1111-1111-1111-111111111111', 'yellow', 'active'),
  ('fd6e998d-1376-42b1-a444-cc160cc3637a', 'SL-YMEQN', 'ab@sundayleaguefc.ng', 'AB', 'AB', 'member', '11111111-1111-1111-1111-111111111111', 'green', 'active'),
  ('394fc37c-6ad8-479e-a08a-e646c5bcee8c', 'SL-5TM3D', 'lion@sundayleaguefc.ng', 'Lion', 'Lion', 'member', '11111111-1111-1111-1111-111111111111', 'red', 'active'),
  ('7cde3f24-31ad-4232-a512-a190a4aa1937', 'SL-TVH62', 'calm@sundayleaguefc.ng', 'Calm', 'Calm', 'member', '11111111-1111-1111-1111-111111111111', 'green', 'active'),
  ('f4d8247e-4ea3-49b4-a57f-6ece7e006ca8', 'SL-8K4P2', 'esu@sundayleaguefc.ng', 'Esu', 'Esu', 'member', '11111111-1111-1111-1111-111111111111', 'green', 'active'),
  ('7b372eb5-1877-4100-aed2-257a50b3d800', 'SL-7XH5Q', 'bluee@sundayleaguefc.ng', 'Bluee', 'Bluee', 'member', '11111111-1111-1111-1111-111111111111', 'green', 'active'),
  ('bca91ec7-b30b-49ca-a38b-ce868e737950', 'SL-JND3E', 'topboss@sundayleaguefc.ng', 'Topboss', 'Topboss', 'member', '11111111-1111-1111-1111-111111111111', 'green', 'active'),
  ('2255d0ca-1b35-4077-a8ce-a99f65ae0bf9', 'SL-VDBNE', 'kaybee@sundayleaguefc.ng', 'Kaybee', 'Kaybee', 'member', '11111111-1111-1111-1111-111111111111', 'yellow', 'active'),
  ('a9224138-524b-41f1-af62-7b8d56e06fd7', 'SL-75P65', 'hollowman@sundayleaguefc.ng', 'Hollowman', 'Hollowman', 'member', '11111111-1111-1111-1111-111111111111', 'yellow', 'active'),
  ('21b564a8-8aec-43d6-aaa3-19cd08e19853', 'SL-79QX3', 'alex@sundayleaguefc.ng', 'Alex', 'Alex', 'member', '11111111-1111-1111-1111-111111111111', 'red', 'active'),
  ('62ca7f7b-f71d-40e5-a8ef-6677e4311dcc', 'SL-S2ZEH', 'ay@sundayleaguefc.ng', 'AY', 'AY', 'member', '11111111-1111-1111-1111-111111111111', 'yellow', 'active'),
  ('9387ff49-84fb-4fbd-a7ae-7bfd21d038f5', 'SL-4UXDF', 'francis@sundayleaguefc.ng', 'Francis', 'Francis', 'member', '11111111-1111-1111-1111-111111111111', 'yellow', 'active'),
  ('737b35ce-1a25-48fa-a4a6-495ead42ba49', 'SL-G3DZ2', 'sero@sundayleaguefc.ng', 'Sero', 'Sero', 'member', '11111111-1111-1111-1111-111111111111', 'red', 'active'),
  ('b8cae70a-d97b-42f1-ab3b-6a10adff4699', 'SL-H5YK3', 'muhammed@sundayleaguefc.ng', 'Muhammed', 'Muhammed', 'member', '11111111-1111-1111-1111-111111111111', 'green', 'active'),
  ('401b3670-8e48-4504-a3d9-c90f51113ce9', 'SL-5GKW8', 'william@sundayleaguefc.ng', 'William', 'William', 'member', '11111111-1111-1111-1111-111111111111', 'yellow', 'active'),
  ('bc004f93-a52b-425d-a866-7a94755c2053', 'SL-ZYNRB', 'olamide@sundayleaguefc.ng', 'Olamide', 'Olamide', 'member', '11111111-1111-1111-1111-111111111111', 'red', 'active'),
  ('da7ca6c0-ca20-451c-a426-adf1ddddd0e0', 'SL-8UNPY', 'uvi@sundayleaguefc.ng', 'Uvi', 'Uvi', 'member', '11111111-1111-1111-1111-111111111111', 'yellow', 'active'),
  ('c5cd29fb-ce1c-499e-a207-6510509f7e33', 'SL-M23HP', 'mudashir@sundayleaguefc.ng', 'Mudashir', 'Mudashir', 'member', '11111111-1111-1111-1111-111111111111', 'red', 'active'),
  ('6798cc4c-c2dc-447d-aadd-36a4624e03fb', 'SL-2MTDH', 'samuel@sundayleaguefc.ng', 'Samuel', 'Samuel', 'member', '11111111-1111-1111-1111-111111111111', 'green', 'active'),
  ('e9539b80-9fb8-41b7-aca2-421c316a4c95', 'SL-63WZ8', 'babakay@sundayleaguefc.ng', 'Babakay', 'Babakay', 'member', '11111111-1111-1111-1111-111111111111', 'green', 'active'),
  ('a8e9f548-cea1-48da-a9f6-12ef4455c5b6', 'SL-3M7R9', 'david@sundayleaguefc.ng', 'David', 'David', 'member', '11111111-1111-1111-1111-111111111111', 'green', 'active'),
  ('766048ac-c937-4fe5-a3df-06cecb920a87', 'SL-BR5CD', 'joshua@sundayleaguefc.ng', 'Joshua', 'Joshua', 'member', '11111111-1111-1111-1111-111111111111', 'green', 'active'),
  ('07dc5efe-d585-4169-a965-cbc8c01be884', 'SL-TEBAZ', 'khalid@sundayleaguefc.ng', 'Khalid', 'Khalid', 'member', '11111111-1111-1111-1111-111111111111', 'green', 'active'),
  ('df1bc67e-d85a-4d20-a136-c5a7bb63a9ed', 'SL-HHRN6', 'jay@sundayleaguefc.ng', 'Jay', 'Jay', 'member', '11111111-1111-1111-1111-111111111111', 'green', 'active'),
  ('7ea82af4-74ba-4608-ac55-3056c99793ca', 'SL-9AYKZ', 'makenzy@sundayleaguefc.ng', 'Makenzy', 'Makenzy', 'member', '11111111-1111-1111-1111-111111111111', 'green', 'active'),
  ('8e3145bd-751b-4ec6-a774-2a1b8d881d56', 'SL-PFC5X', 'whyte@sundayleaguefc.ng', 'Whyte', 'Whyte', 'member', '11111111-1111-1111-1111-111111111111', 'green', 'active'),
  ('a4677ce6-5398-4949-a128-c36fd7caf7d5', 'SL-UN872', 'kamil@sundayleaguefc.ng', 'Kamil', 'Kamil', 'member', '11111111-1111-1111-1111-111111111111', 'green', 'active'),
  ('09a6ff0e-c54c-4b0b-ab3f-c2fe7118b80f', 'SL-N672A', 'sk@sundayleaguefc.ng', 'SK', 'SK', 'member', '11111111-1111-1111-1111-111111111111', 'green', 'active'),
  ('154d5802-e2e7-40da-a48c-5ee1d09aee2e', 'SL-2EW52', 'bruno@sundayleaguefc.ng', 'Bruno', 'Bruno', 'member', '11111111-1111-1111-1111-111111111111', 'green', 'active'),
  ('69119ef5-6e66-4968-a038-25f4eaea8a0d', 'SL-ZQM9V', 'hammed@sundayleaguefc.ng', 'Hammed', 'Hammed', 'member', '11111111-1111-1111-1111-111111111111', 'green', 'active')
ON CONFLICT (member_id) DO UPDATE SET
  eligibility_status = EXCLUDED.eligibility_status,
  updated_at = NOW();

-- 2. INSERT PLAYERS DOSSIER
INSERT INTO public.players (user_id, jersey_number, primary_position, overall_rating) VALUES
  ('e2ed7dd1-911e-444e-a843-aa2ee0738d19', 1, 'CAM', 75),
  ('10a54561-7ef5-4955-a2cb-225f90a0eb24', 2, 'ST', 76),
  ('23a7df9a-10a4-49ef-ae64-d69ab09c056e', 3, 'CM', 77),
  ('1875c436-e149-4880-a129-51962ff15003', 4, 'CB', 78),
  ('f50d9317-53bf-443a-a95e-2816df3b1a6d', 5, 'RW', 79),
  ('2496b74c-a3a8-47b7-a783-9cb6b7a80b92', 6, 'LW', 80),
  ('caf84eca-0d66-4aab-a012-7db6bde57014', 7, 'CDM', 81),
  ('b69a34a7-5f5b-4cdd-ad76-987c40df79a9', 8, 'LB', 82),
  ('b496afde-6ed3-4fa6-aeab-c276d997d6a9', 9, 'RB', 83),
  ('71a6c0a1-5c5e-4389-a818-1227919c7eb5', 10, 'GK', 84),
  ('5b1e1811-6125-4675-a922-303ded312071', 11, 'CAM', 85),
  ('815b2b57-afb7-479d-a293-6994ea44a842', 12, 'ST', 86),
  ('b29485c7-bf27-4a3c-aa9a-a56cef3c86da', 13, 'CM', 75),
  ('433beb18-466c-4a2c-a8b5-ebddcc796da7', 14, 'CB', 76),
  ('fd6e998d-1376-42b1-a444-cc160cc3637a', 15, 'RW', 77),
  ('394fc37c-6ad8-479e-a08a-e646c5bcee8c', 16, 'LW', 78),
  ('7cde3f24-31ad-4232-a512-a190a4aa1937', 17, 'CDM', 79),
  ('f4d8247e-4ea3-49b4-a57f-6ece7e006ca8', 18, 'LB', 80),
  ('7b372eb5-1877-4100-aed2-257a50b3d800', 19, 'RB', 81),
  ('bca91ec7-b30b-49ca-a38b-ce868e737950', 20, 'GK', 82),
  ('2255d0ca-1b35-4077-a8ce-a99f65ae0bf9', 21, 'CAM', 83),
  ('a9224138-524b-41f1-af62-7b8d56e06fd7', 22, 'ST', 84),
  ('21b564a8-8aec-43d6-aaa3-19cd08e19853', 23, 'CM', 85),
  ('62ca7f7b-f71d-40e5-a8ef-6677e4311dcc', 24, 'CB', 86),
  ('9387ff49-84fb-4fbd-a7ae-7bfd21d038f5', 25, 'RW', 75),
  ('737b35ce-1a25-48fa-a4a6-495ead42ba49', 26, 'LW', 76),
  ('b8cae70a-d97b-42f1-ab3b-6a10adff4699', 27, 'CDM', 77),
  ('401b3670-8e48-4504-a3d9-c90f51113ce9', 28, 'LB', 78),
  ('bc004f93-a52b-425d-a866-7a94755c2053', 29, 'RB', 79),
  ('da7ca6c0-ca20-451c-a426-adf1ddddd0e0', 30, 'GK', 80),
  ('c5cd29fb-ce1c-499e-a207-6510509f7e33', 31, 'CAM', 81),
  ('6798cc4c-c2dc-447d-aadd-36a4624e03fb', 32, 'ST', 82),
  ('e9539b80-9fb8-41b7-aca2-421c316a4c95', 33, 'CM', 83),
  ('a8e9f548-cea1-48da-a9f6-12ef4455c5b6', 34, 'CB', 84),
  ('766048ac-c937-4fe5-a3df-06cecb920a87', 35, 'RW', 85),
  ('07dc5efe-d585-4169-a965-cbc8c01be884', 36, 'LW', 86),
  ('df1bc67e-d85a-4d20-a136-c5a7bb63a9ed', 37, 'CDM', 75),
  ('7ea82af4-74ba-4608-ac55-3056c99793ca', 38, 'LB', 76),
  ('8e3145bd-751b-4ec6-a774-2a1b8d881d56', 39, 'RB', 77),
  ('a4677ce6-5398-4949-a128-c36fd7caf7d5', 40, 'GK', 78),
  ('09a6ff0e-c54c-4b0b-ab3f-c2fe7118b80f', 41, 'CAM', 79),
  ('154d5802-e2e7-40da-a48c-5ee1d09aee2e', 42, 'ST', 80),
  ('69119ef5-6e66-4968-a038-25f4eaea8a0d', 43, 'CM', 81)
ON CONFLICT (user_id) DO NOTHING;

-- 3. INSERT PAYMENT PLANS
INSERT INTO public.payment_plans (id, user_id, club_id, season, title, total_amount, amount_paid, status, next_due_date) VALUES
  ('0736489b-dca0-4be8-acd0-2b2c951052c1', 'e2ed7dd1-911e-444e-a843-aa2ee0738d19', '11111111-1111-1111-1111-111111111111', '2026/2027', '2026 Membership Subscription', 80000.00, 80000.00, 'partially_paid', '2026-10-30'),
  ('e4f45880-a9f3-48fa-a3ab-91e1c51cddfe', '10a54561-7ef5-4955-a2cb-225f90a0eb24', '11111111-1111-1111-1111-111111111111', '2026/2027', '2026 Membership Subscription', 80000.00, 80000.00, 'fully_paid', '2026-10-30'),
  ('e12101e2-52b7-4312-a94d-1b20ed80e5a8', '23a7df9a-10a4-49ef-ae64-d69ab09c056e', '11111111-1111-1111-1111-111111111111', '2026/2027', '2026 Membership Subscription', 80000.00, 80000.00, 'fully_paid', '2026-10-30'),
  ('c1c7714f-a010-46e2-a408-971ca0e06ba4', '1875c436-e149-4880-a129-51962ff15003', '11111111-1111-1111-1111-111111111111', '2026/2027', '2026 Membership Subscription', 80000.00, 80000.00, 'fully_paid', '2026-10-30'),
  ('4fca957b-0e48-4d3e-a091-918bb9fd471a', 'f50d9317-53bf-443a-a95e-2816df3b1a6d', '11111111-1111-1111-1111-111111111111', '2026/2027', '2026 Membership Subscription', 80000.00, 80000.00, 'fully_paid', '2026-10-30'),
  ('c26200d2-8b6c-4012-a52c-22572f9b7d8a', '2496b74c-a3a8-47b7-a783-9cb6b7a80b92', '11111111-1111-1111-1111-111111111111', '2026/2027', '2026 Membership Subscription', 80000.00, 80000.00, 'fully_paid', '2026-10-30'),
  ('400d6575-83fb-4910-a18d-e4583fca2299', 'caf84eca-0d66-4aab-a012-7db6bde57014', '11111111-1111-1111-1111-111111111111', '2026/2027', '2026 Membership Subscription', 80000.00, 80000.00, 'fully_paid', '2026-10-30'),
  ('6933fc85-2450-43bd-a3b3-5b7d5543d98a', 'b69a34a7-5f5b-4cdd-ad76-987c40df79a9', '11111111-1111-1111-1111-111111111111', '2026/2027', '2026 Membership Subscription', 80000.00, 80000.00, 'fully_paid', '2026-10-30'),
  ('bcf555ef-5e3f-429e-a894-42f355075d90', 'b496afde-6ed3-4fa6-aeab-c276d997d6a9', '11111111-1111-1111-1111-111111111111', '2026/2027', '2026 Membership Subscription', 80000.00, 80000.00, 'partially_paid', '2026-10-30'),
  ('9cf16904-efdc-4c6a-a413-9411aa030753', '71a6c0a1-5c5e-4389-a818-1227919c7eb5', '11111111-1111-1111-1111-111111111111', '2026/2027', '2026 Membership Subscription', 80000.00, 80000.00, 'partially_paid', '2026-10-30'),
  ('5405a341-840f-4dc7-a5dd-ce1c98612e76', '5b1e1811-6125-4675-a922-303ded312071', '11111111-1111-1111-1111-111111111111', '2026/2027', '2026 Membership Subscription', 80000.00, 80000.00, 'partially_paid', '2026-10-30'),
  ('7f0ff23f-e431-401b-ad15-29ad27408af7', '815b2b57-afb7-479d-a293-6994ea44a842', '11111111-1111-1111-1111-111111111111', '2026/2027', '2026 Membership Subscription', 80000.00, 80000.00, 'partially_paid', '2026-10-30'),
  ('93d19b80-eb0f-41cc-a05d-0c033073ac3f', 'b29485c7-bf27-4a3c-aa9a-a56cef3c86da', '11111111-1111-1111-1111-111111111111', '2026/2027', '2026 Membership Subscription', 80000.00, 80000.00, 'fully_paid', '2026-10-30'),
  ('5ca52b68-1fc7-4a85-a97a-b3bf9e21a3b4', '433beb18-466c-4a2c-a8b5-ebddcc796da7', '11111111-1111-1111-1111-111111111111', '2026/2027', '2026 Membership Subscription', 80000.00, 80000.00, 'partially_paid', '2026-10-30'),
  ('9ffefdb3-e2a9-482f-a9b8-27fbfaece91d', 'fd6e998d-1376-42b1-a444-cc160cc3637a', '11111111-1111-1111-1111-111111111111', '2026/2027', '2026 Membership Subscription', 80000.00, 80000.00, 'fully_paid', '2026-10-30'),
  ('f3e033ee-0e85-43e6-a511-6ad2c0f2e0c8', '394fc37c-6ad8-479e-a08a-e646c5bcee8c', '11111111-1111-1111-1111-111111111111', '2026/2027', '2026 Membership Subscription', 80000.00, 0.00, 'unpaid', '2026-10-30'),
  ('30e14c58-587e-4733-a2ed-2540dbdcef25', '7cde3f24-31ad-4232-a512-a190a4aa1937', '11111111-1111-1111-1111-111111111111', '2026/2027', '2026 Membership Subscription', 80000.00, 80000.00, 'fully_paid', '2026-10-30'),
  ('a64edfa8-2d9a-449a-a158-f84532a26912', 'f4d8247e-4ea3-49b4-a57f-6ece7e006ca8', '11111111-1111-1111-1111-111111111111', '2026/2027', '2026 Membership Subscription', 160000.00, 160000.00, 'fully_paid', '2026-10-30'),
  ('010107d4-69ef-4626-abbb-9d5eebe53106', '7b372eb5-1877-4100-aed2-257a50b3d800', '11111111-1111-1111-1111-111111111111', '2026/2027', '2026 Membership Subscription', 80000.00, 80000.00, 'fully_paid', '2026-10-30'),
  ('87cb420d-e7aa-43dd-a868-94c2d7daa7ae', 'bca91ec7-b30b-49ca-a38b-ce868e737950', '11111111-1111-1111-1111-111111111111', '2026/2027', '2026 Membership Subscription', 80000.00, 80000.00, 'fully_paid', '2026-10-30'),
  ('51d4cb07-13aa-4d3b-a951-59178460dea7', '2255d0ca-1b35-4077-a8ce-a99f65ae0bf9', '11111111-1111-1111-1111-111111111111', '2026/2027', '2026 Membership Subscription', 80000.00, 60000.00, 'partially_paid', '2026-10-30'),
  ('f0c916af-bfca-4fe7-a948-c9094c3b7653', 'a9224138-524b-41f1-af62-7b8d56e06fd7', '11111111-1111-1111-1111-111111111111', '2026/2027', '2026 Membership Subscription', 80000.00, 80000.00, 'partially_paid', '2026-10-30'),
  ('3d1223b0-9b96-4527-a54a-86573a840d3d', '21b564a8-8aec-43d6-aaa3-19cd08e19853', '11111111-1111-1111-1111-111111111111', '2026/2027', '2026 Membership Subscription', 80000.00, 50000.00, 'partially_paid', '2026-10-30'),
  ('96272b76-cc4d-4799-ae62-a1671a158ef3', '62ca7f7b-f71d-40e5-a8ef-6677e4311dcc', '11111111-1111-1111-1111-111111111111', '2026/2027', '2026 Membership Subscription', 80000.00, 80000.00, 'partially_paid', '2026-10-30'),
  ('693237ae-85e6-41a1-adca-c7cd7f7c3e46', '9387ff49-84fb-4fbd-a7ae-7bfd21d038f5', '11111111-1111-1111-1111-111111111111', '2026/2027', '2026 Membership Subscription', 80000.00, 80000.00, 'partially_paid', '2026-10-30'),
  ('5240a51a-4d49-49c9-a5f9-221ecdcc59c6', '737b35ce-1a25-48fa-a4a6-495ead42ba49', '11111111-1111-1111-1111-111111111111', '2026/2027', '2026 Membership Subscription', 80000.00, 50000.00, 'partially_paid', '2026-10-30'),
  ('6f21712a-ec90-418f-a0ef-5c2c1a60466c', 'b8cae70a-d97b-42f1-ab3b-6a10adff4699', '11111111-1111-1111-1111-111111111111', '2026/2027', '2026 Membership Subscription', 80000.00, 80000.00, 'fully_paid', '2026-10-30'),
  ('6bb264ff-b8f5-48f4-a239-72a95ff60c50', '401b3670-8e48-4504-a3d9-c90f51113ce9', '11111111-1111-1111-1111-111111111111', '2026/2027', '2026 Membership Subscription', 80000.00, 80000.00, 'partially_paid', '2026-10-30'),
  ('4872dc26-3585-432a-a98f-993a0b0b9dcd', 'bc004f93-a52b-425d-a866-7a94755c2053', '11111111-1111-1111-1111-111111111111', '2026/2027', '2026 Membership Subscription', 80000.00, 0.00, 'unpaid', '2026-10-30'),
  ('1766bbcc-5f5d-4533-a7bf-057ae29c88a7', 'da7ca6c0-ca20-451c-a426-adf1ddddd0e0', '11111111-1111-1111-1111-111111111111', '2026/2027', '2026 Membership Subscription', 80000.00, 80000.00, 'partially_paid', '2026-10-30'),
  ('14367834-18b3-4742-a375-266f2fd9105f', 'c5cd29fb-ce1c-499e-a207-6510509f7e33', '11111111-1111-1111-1111-111111111111', '2026/2027', '2026 Membership Subscription', 80000.00, 0.00, 'unpaid', '2026-10-30'),
  ('858c9b77-46ea-429a-a06e-a791ae10a71b', '6798cc4c-c2dc-447d-aadd-36a4624e03fb', '11111111-1111-1111-1111-111111111111', '2026/2027', '2026 Membership Subscription', 80000.00, 80000.00, 'fully_paid', '2026-10-30'),
  ('1916a5d5-b472-48ef-a33d-c90a8f9d3274', 'e9539b80-9fb8-41b7-aca2-421c316a4c95', '11111111-1111-1111-1111-111111111111', '2026/2027', '2026 Membership Subscription', 80000.00, 80000.00, 'fully_paid', '2026-10-30'),
  ('7fd2691f-2a28-40c4-ae07-459aa2a3cb26', 'a8e9f548-cea1-48da-a9f6-12ef4455c5b6', '11111111-1111-1111-1111-111111111111', '2026/2027', '2026 Membership Subscription', 80000.00, 80000.00, 'fully_paid', '2026-10-30'),
  ('281c1d73-ee48-4777-adcf-67b5094d10b6', '766048ac-c937-4fe5-a3df-06cecb920a87', '11111111-1111-1111-1111-111111111111', '2026/2027', '2026 Membership Subscription', 80000.00, 80000.00, 'fully_paid', '2026-10-30'),
  ('e4393aec-e665-49f3-a875-98de82c547d3', '07dc5efe-d585-4169-a965-cbc8c01be884', '11111111-1111-1111-1111-111111111111', '2026/2027', '2026 Membership Subscription', 80000.00, 80000.00, 'fully_paid', '2026-10-30'),
  ('ce95416f-bfdc-4795-ae38-5048da3dfc53', 'df1bc67e-d85a-4d20-a136-c5a7bb63a9ed', '11111111-1111-1111-1111-111111111111', '2026/2027', '2026 Membership Subscription', 80000.00, 80000.00, 'fully_paid', '2026-10-30'),
  ('bca57669-52a1-49f0-a29f-ff1773b5afcd', '7ea82af4-74ba-4608-ac55-3056c99793ca', '11111111-1111-1111-1111-111111111111', '2026/2027', '2026 Membership Subscription', 80000.00, 80000.00, 'fully_paid', '2026-10-30'),
  ('77c28fbe-6a04-460e-ad21-ac0d1196cc37', '8e3145bd-751b-4ec6-a774-2a1b8d881d56', '11111111-1111-1111-1111-111111111111', '2026/2027', '2026 Membership Subscription', 80000.00, 80000.00, 'fully_paid', '2026-10-30'),
  ('219fafd0-e3d5-418c-aa26-bd77fc13cc87', 'a4677ce6-5398-4949-a128-c36fd7caf7d5', '11111111-1111-1111-1111-111111111111', '2026/2027', '2026 Membership Subscription', 80000.00, 80000.00, 'fully_paid', '2026-10-30'),
  ('9f01427d-4beb-4c74-a9d3-26ba778fd2ce', '09a6ff0e-c54c-4b0b-ab3f-c2fe7118b80f', '11111111-1111-1111-1111-111111111111', '2026/2027', '2026 Membership Subscription', 80000.00, 80000.00, 'fully_paid', '2026-10-30'),
  ('20ec7577-c260-4176-a073-23ffffb1d846', '154d5802-e2e7-40da-a48c-5ee1d09aee2e', '11111111-1111-1111-1111-111111111111', '2026/2027', '2026 Membership Subscription', 80000.00, 80000.00, 'fully_paid', '2026-10-30'),
  ('924c8276-a862-493e-ae2c-64b42a2a311d', '69119ef5-6e66-4968-a038-25f4eaea8a0d', '11111111-1111-1111-1111-111111111111', '2026/2027', '2026 Membership Subscription', 80000.00, 80000.00, 'fully_paid', '2026-10-30')
ON CONFLICT (id) DO UPDATE SET
  amount_paid = EXCLUDED.amount_paid,
  status = EXCLUDED.status,
  updated_at = NOW();

-- 4. INSERT CONFIRMED PAYMENTS
INSERT INTO public.payments (user_id, club_id, payment_plan_id, payment_type, amount, currency, payment_method, payment_channel, reference, status, description, paid_at) VALUES
  ('e2ed7dd1-911e-444e-a843-aa2ee0738d19', '11111111-1111-1111-1111-111111111111', '0736489b-dca0-4be8-acd0-2b2c951052c1', 'membership', 80000.00, 'NGN', 'bank_transfer', 'admin_manual', 'EXCEL-2026-002-EKO', 'success', 'Excel Ledger Subscription Clearance - Eko', '2026-06-29 12:00:00+00'),
  ('10a54561-7ef5-4955-a2cb-225f90a0eb24', '11111111-1111-1111-1111-111111111111', 'e4f45880-a9f3-48fa-a3ab-91e1c51cddfe', 'membership', 80000.00, 'NGN', 'bank_transfer', 'admin_manual', 'EXCEL-2026-003-AFOO', 'success', 'Excel Ledger Subscription Clearance - Afoo', '2026-06-29 12:00:00+00'),
  ('23a7df9a-10a4-49ef-ae64-d69ab09c056e', '11111111-1111-1111-1111-111111111111', 'e12101e2-52b7-4312-a94d-1b20ed80e5a8', 'membership', 80000.00, 'NGN', 'bank_transfer', 'admin_manual', 'EXCEL-2026-004-BADM', 'success', 'Excel Ledger Subscription Clearance - Badmus', '2026-06-29 12:00:00+00'),
  ('1875c436-e149-4880-a129-51962ff15003', '11111111-1111-1111-1111-111111111111', 'c1c7714f-a010-46e2-a408-971ca0e06ba4', 'membership', 80000.00, 'NGN', 'bank_transfer', 'admin_manual', 'EXCEL-2026-005-PAIG', 'success', 'Excel Ledger Subscription Clearance - Paige', '2026-06-29 12:00:00+00'),
  ('f50d9317-53bf-443a-a95e-2816df3b1a6d', '11111111-1111-1111-1111-111111111111', '4fca957b-0e48-4d3e-a091-918bb9fd471a', 'membership', 80000.00, 'NGN', 'bank_transfer', 'admin_manual', 'EXCEL-2026-006-LUCK', 'success', 'Excel Ledger Subscription Clearance - Lucky', '2026-06-29 12:00:00+00'),
  ('2496b74c-a3a8-47b7-a783-9cb6b7a80b92', '11111111-1111-1111-1111-111111111111', 'c26200d2-8b6c-4012-a52c-22572f9b7d8a', 'membership', 80000.00, 'NGN', 'bank_transfer', 'admin_manual', 'EXCEL-2026-007-TOPE', 'success', 'Excel Ledger Subscription Clearance - Tope', '2026-06-29 12:00:00+00'),
  ('caf84eca-0d66-4aab-a012-7db6bde57014', '11111111-1111-1111-1111-111111111111', '400d6575-83fb-4910-a18d-e4583fca2299', 'membership', 80000.00, 'NGN', 'bank_transfer', 'admin_manual', 'EXCEL-2026-008-KUNL', 'success', 'Excel Ledger Subscription Clearance - Kunle', '2026-06-29 12:00:00+00'),
  ('b69a34a7-5f5b-4cdd-ad76-987c40df79a9', '11111111-1111-1111-1111-111111111111', '6933fc85-2450-43bd-a3b3-5b7d5543d98a', 'membership', 80000.00, 'NGN', 'bank_transfer', 'admin_manual', 'EXCEL-2026-009-ADE', 'success', 'Excel Ledger Subscription Clearance - Ade', '2026-06-29 12:00:00+00'),
  ('b496afde-6ed3-4fa6-aeab-c276d997d6a9', '11111111-1111-1111-1111-111111111111', 'bcf555ef-5e3f-429e-a894-42f355075d90', 'membership', 80000.00, 'NGN', 'bank_transfer', 'admin_manual', 'EXCEL-2026-010-JUNI', 'success', 'Excel Ledger Subscription Clearance - Junior', '2026-06-29 12:00:00+00'),
  ('71a6c0a1-5c5e-4389-a818-1227919c7eb5', '11111111-1111-1111-1111-111111111111', '9cf16904-efdc-4c6a-a413-9411aa030753', 'membership', 80000.00, 'NGN', 'bank_transfer', 'admin_manual', 'EXCEL-2026-011-CHAR', 'success', 'Excel Ledger Subscription Clearance - Charles', '2026-06-29 12:00:00+00'),
  ('5b1e1811-6125-4675-a922-303ded312071', '11111111-1111-1111-1111-111111111111', '5405a341-840f-4dc7-a5dd-ce1c98612e76', 'membership', 80000.00, 'NGN', 'bank_transfer', 'admin_manual', 'EXCEL-2026-012-RADO', 'success', 'Excel Ledger Subscription Clearance - Rado', '2026-06-29 12:00:00+00'),
  ('815b2b57-afb7-479d-a293-6994ea44a842', '11111111-1111-1111-1111-111111111111', '7f0ff23f-e431-401b-ad15-29ad27408af7', 'membership', 80000.00, 'NGN', 'bank_transfer', 'admin_manual', 'EXCEL-2026-013-BEE', 'success', 'Excel Ledger Subscription Clearance - Bee', '2026-06-29 12:00:00+00'),
  ('b29485c7-bf27-4a3c-aa9a-a56cef3c86da', '11111111-1111-1111-1111-111111111111', '93d19b80-eb0f-41cc-a05d-0c033073ac3f', 'membership', 80000.00, 'NGN', 'bank_transfer', 'admin_manual', 'EXCEL-2026-014-MILA', 'success', 'Excel Ledger Subscription Clearance - Mila', '2026-06-29 12:00:00+00'),
  ('433beb18-466c-4a2c-a8b5-ebddcc796da7', '11111111-1111-1111-1111-111111111111', '5ca52b68-1fc7-4a85-a97a-b3bf9e21a3b4', 'membership', 80000.00, 'NGN', 'bank_transfer', 'admin_manual', 'EXCEL-2026-015-FEMI', 'success', 'Excel Ledger Subscription Clearance - Femi', '2026-06-29 12:00:00+00'),
  ('fd6e998d-1376-42b1-a444-cc160cc3637a', '11111111-1111-1111-1111-111111111111', '9ffefdb3-e2a9-482f-a9b8-27fbfaece91d', 'membership', 80000.00, 'NGN', 'bank_transfer', 'admin_manual', 'EXCEL-2026-016-AB', 'success', 'Excel Ledger Subscription Clearance - AB', '2026-06-29 12:00:00+00'),
  ('7cde3f24-31ad-4232-a512-a190a4aa1937', '11111111-1111-1111-1111-111111111111', '30e14c58-587e-4733-a2ed-2540dbdcef25', 'membership', 80000.00, 'NGN', 'bank_transfer', 'admin_manual', 'EXCEL-2026-018-CALM', 'success', 'Excel Ledger Subscription Clearance - Calm', '2026-06-29 12:00:00+00'),
  ('f4d8247e-4ea3-49b4-a57f-6ece7e006ca8', '11111111-1111-1111-1111-111111111111', 'a64edfa8-2d9a-449a-a158-f84532a26912', 'membership', 160000.00, 'NGN', 'bank_transfer', 'admin_manual', 'EXCEL-2026-019-ESU', 'success', 'Excel Ledger Subscription Clearance - Esu', '2026-06-29 12:00:00+00'),
  ('7b372eb5-1877-4100-aed2-257a50b3d800', '11111111-1111-1111-1111-111111111111', '010107d4-69ef-4626-abbb-9d5eebe53106', 'membership', 80000.00, 'NGN', 'bank_transfer', 'admin_manual', 'EXCEL-2026-020-BLUE', 'success', 'Excel Ledger Subscription Clearance - Bluee', '2026-06-29 12:00:00+00'),
  ('bca91ec7-b30b-49ca-a38b-ce868e737950', '11111111-1111-1111-1111-111111111111', '87cb420d-e7aa-43dd-a868-94c2d7daa7ae', 'membership', 80000.00, 'NGN', 'bank_transfer', 'admin_manual', 'EXCEL-2026-021-TOPB', 'success', 'Excel Ledger Subscription Clearance - Topboss', '2026-06-29 12:00:00+00'),
  ('2255d0ca-1b35-4077-a8ce-a99f65ae0bf9', '11111111-1111-1111-1111-111111111111', '51d4cb07-13aa-4d3b-a951-59178460dea7', 'membership', 60000.00, 'NGN', 'bank_transfer', 'admin_manual', 'EXCEL-2026-022-KAYB', 'success', 'Excel Ledger Subscription Clearance - Kaybee', '2026-06-29 12:00:00+00'),
  ('a9224138-524b-41f1-af62-7b8d56e06fd7', '11111111-1111-1111-1111-111111111111', 'f0c916af-bfca-4fe7-a948-c9094c3b7653', 'membership', 80000.00, 'NGN', 'bank_transfer', 'admin_manual', 'EXCEL-2026-023-HOLL', 'success', 'Excel Ledger Subscription Clearance - Hollowman', '2026-06-29 12:00:00+00'),
  ('21b564a8-8aec-43d6-aaa3-19cd08e19853', '11111111-1111-1111-1111-111111111111', '3d1223b0-9b96-4527-a54a-86573a840d3d', 'membership', 50000.00, 'NGN', 'bank_transfer', 'admin_manual', 'EXCEL-2026-024-ALEX', 'success', 'Excel Ledger Subscription Clearance - Alex', '2026-06-29 12:00:00+00'),
  ('62ca7f7b-f71d-40e5-a8ef-6677e4311dcc', '11111111-1111-1111-1111-111111111111', '96272b76-cc4d-4799-ae62-a1671a158ef3', 'membership', 80000.00, 'NGN', 'bank_transfer', 'admin_manual', 'EXCEL-2026-025-AY', 'success', 'Excel Ledger Subscription Clearance - AY', '2026-06-29 12:00:00+00'),
  ('9387ff49-84fb-4fbd-a7ae-7bfd21d038f5', '11111111-1111-1111-1111-111111111111', '693237ae-85e6-41a1-adca-c7cd7f7c3e46', 'membership', 80000.00, 'NGN', 'bank_transfer', 'admin_manual', 'EXCEL-2026-026-FRAN', 'success', 'Excel Ledger Subscription Clearance - Francis', '2026-06-29 12:00:00+00'),
  ('737b35ce-1a25-48fa-a4a6-495ead42ba49', '11111111-1111-1111-1111-111111111111', '5240a51a-4d49-49c9-a5f9-221ecdcc59c6', 'membership', 50000.00, 'NGN', 'bank_transfer', 'admin_manual', 'EXCEL-2026-027-SERO', 'success', 'Excel Ledger Subscription Clearance - Sero', '2026-06-29 12:00:00+00'),
  ('b8cae70a-d97b-42f1-ab3b-6a10adff4699', '11111111-1111-1111-1111-111111111111', '6f21712a-ec90-418f-a0ef-5c2c1a60466c', 'membership', 80000.00, 'NGN', 'bank_transfer', 'admin_manual', 'EXCEL-2026-028-MUHA', 'success', 'Excel Ledger Subscription Clearance - Muhammed', '2026-06-29 12:00:00+00'),
  ('401b3670-8e48-4504-a3d9-c90f51113ce9', '11111111-1111-1111-1111-111111111111', '6bb264ff-b8f5-48f4-a239-72a95ff60c50', 'membership', 80000.00, 'NGN', 'bank_transfer', 'admin_manual', 'EXCEL-2026-029-WILL', 'success', 'Excel Ledger Subscription Clearance - William', '2026-06-29 12:00:00+00'),
  ('da7ca6c0-ca20-451c-a426-adf1ddddd0e0', '11111111-1111-1111-1111-111111111111', '1766bbcc-5f5d-4533-a7bf-057ae29c88a7', 'membership', 80000.00, 'NGN', 'bank_transfer', 'admin_manual', 'EXCEL-2026-031-UVI', 'success', 'Excel Ledger Subscription Clearance - Uvi', '2026-06-29 12:00:00+00'),
  ('6798cc4c-c2dc-447d-aadd-36a4624e03fb', '11111111-1111-1111-1111-111111111111', '858c9b77-46ea-429a-a06e-a791ae10a71b', 'membership', 80000.00, 'NGN', 'bank_transfer', 'admin_manual', 'EXCEL-2026-033-SAMU', 'success', 'Excel Ledger Subscription Clearance - Samuel', '2026-06-29 12:00:00+00'),
  ('e9539b80-9fb8-41b7-aca2-421c316a4c95', '11111111-1111-1111-1111-111111111111', '1916a5d5-b472-48ef-a33d-c90a8f9d3274', 'membership', 80000.00, 'NGN', 'bank_transfer', 'admin_manual', 'EXCEL-2026-034-BABA', 'success', 'Excel Ledger Subscription Clearance - Babakay', '2026-06-29 12:00:00+00'),
  ('a8e9f548-cea1-48da-a9f6-12ef4455c5b6', '11111111-1111-1111-1111-111111111111', '7fd2691f-2a28-40c4-ae07-459aa2a3cb26', 'membership', 80000.00, 'NGN', 'bank_transfer', 'admin_manual', 'EXCEL-2026-035-DAVI', 'success', 'Excel Ledger Subscription Clearance - David', '2026-06-29 12:00:00+00'),
  ('766048ac-c937-4fe5-a3df-06cecb920a87', '11111111-1111-1111-1111-111111111111', '281c1d73-ee48-4777-adcf-67b5094d10b6', 'membership', 80000.00, 'NGN', 'bank_transfer', 'admin_manual', 'EXCEL-2026-036-JOSH', 'success', 'Excel Ledger Subscription Clearance - Joshua', '2026-06-29 12:00:00+00'),
  ('07dc5efe-d585-4169-a965-cbc8c01be884', '11111111-1111-1111-1111-111111111111', 'e4393aec-e665-49f3-a875-98de82c547d3', 'membership', 80000.00, 'NGN', 'bank_transfer', 'admin_manual', 'EXCEL-2026-037-KHAL', 'success', 'Excel Ledger Subscription Clearance - Khalid', '2026-06-29 12:00:00+00'),
  ('df1bc67e-d85a-4d20-a136-c5a7bb63a9ed', '11111111-1111-1111-1111-111111111111', 'ce95416f-bfdc-4795-ae38-5048da3dfc53', 'membership', 80000.00, 'NGN', 'bank_transfer', 'admin_manual', 'EXCEL-2026-038-JAY', 'success', 'Excel Ledger Subscription Clearance - Jay', '2026-06-29 12:00:00+00'),
  ('7ea82af4-74ba-4608-ac55-3056c99793ca', '11111111-1111-1111-1111-111111111111', 'bca57669-52a1-49f0-a29f-ff1773b5afcd', 'membership', 80000.00, 'NGN', 'bank_transfer', 'admin_manual', 'EXCEL-2026-039-MAKE', 'success', 'Excel Ledger Subscription Clearance - Makenzy', '2026-06-29 12:00:00+00'),
  ('8e3145bd-751b-4ec6-a774-2a1b8d881d56', '11111111-1111-1111-1111-111111111111', '77c28fbe-6a04-460e-ad21-ac0d1196cc37', 'membership', 80000.00, 'NGN', 'bank_transfer', 'admin_manual', 'EXCEL-2026-040-WHYT', 'success', 'Excel Ledger Subscription Clearance - Whyte', '2026-06-29 12:00:00+00'),
  ('a4677ce6-5398-4949-a128-c36fd7caf7d5', '11111111-1111-1111-1111-111111111111', '219fafd0-e3d5-418c-aa26-bd77fc13cc87', 'membership', 80000.00, 'NGN', 'bank_transfer', 'admin_manual', 'EXCEL-2026-041-KAMI', 'success', 'Excel Ledger Subscription Clearance - Kamil', '2026-06-29 12:00:00+00'),
  ('09a6ff0e-c54c-4b0b-ab3f-c2fe7118b80f', '11111111-1111-1111-1111-111111111111', '9f01427d-4beb-4c74-a9d3-26ba778fd2ce', 'membership', 80000.00, 'NGN', 'bank_transfer', 'admin_manual', 'EXCEL-2026-042-SK', 'success', 'Excel Ledger Subscription Clearance - SK', '2026-06-29 12:00:00+00'),
  ('154d5802-e2e7-40da-a48c-5ee1d09aee2e', '11111111-1111-1111-1111-111111111111', '20ec7577-c260-4176-a073-23ffffb1d846', 'membership', 80000.00, 'NGN', 'bank_transfer', 'admin_manual', 'EXCEL-2026-043-BRUN', 'success', 'Excel Ledger Subscription Clearance - Bruno', '2026-06-29 12:00:00+00'),
  ('69119ef5-6e66-4968-a038-25f4eaea8a0d', '11111111-1111-1111-1111-111111111111', '924c8276-a862-493e-ae2c-64b42a2a311d', 'membership', 80000.00, 'NGN', 'bank_transfer', 'admin_manual', 'EXCEL-2026-044-HAMM', 'success', 'Excel Ledger Subscription Clearance - Hammed', '2026-06-29 12:00:00+00')
ON CONFLICT (reference) DO NOTHING;

-- 5. RECORD AUDIT LOG ENTRY
INSERT INTO public.audit_logs (actor_name, actor_role, action, reason, details)
VALUES (
  'System Import', 'super_admin', 'EXCEL_MIGRATION',
  'Batch imported 43 members and subscription ledger records from Members payment.xlsx',
  '{"total_members": 43, "source_file": "Members payment.xlsx", "standard_quarterly_fee": 80000}'::jsonb
);

COMMIT;