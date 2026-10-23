-- Private Realtime topics require room membership. Camera broadcasts are presenter-only.
create policy "room members receive live events" on realtime.messages
for select to authenticated using (
  exists (select 1 from public.room_members m
    where m.user_id = auth.uid() and realtime.topic() = 'atelon-room:' || m.room_id::text)
);
create policy "room participants presence and presenter camera" on realtime.messages
for insert to authenticated with check (
  exists (select 1 from public.room_members m join public.research_rooms r on r.id=m.room_id
    where m.user_id = auth.uid() and realtime.topic() = 'atelon-room:' || m.room_id::text
    and (extension = 'presence' or (extension = 'broadcast' and r.owner_id = auth.uid())))
);
