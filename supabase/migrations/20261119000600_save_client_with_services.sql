-- One client can have several services. Saving the client form must write all
-- subscription rows atomically: update the ones that already have an id, insert
-- the new ones, and remove the ones the operator deleted from the form.
create or replace function public.save_client_with_services(
  p_client_id uuid,
  p_full_name text,
  p_email text,
  p_services jsonb
)
returns uuid
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_service jsonb;
  v_kept_ids uuid[] := '{}';
begin
  if p_client_id is null then
    insert into public.clients (full_name, email)
    values (p_full_name, p_email)
    returning id into p_client_id;
  else
    update public.clients
       set full_name = p_full_name,
           email = p_email,
           updated_at = now()
     where id = p_client_id;
  end if;

  for v_service in select * from jsonb_array_elements(p_services) loop
    if v_service->>'id' is null or v_service->>'id' = '' then
      insert into public.subscriptions (
        client_id,
        plan_name,
        amount,
        next_billing_date,
        description
      )
      values (
        p_client_id,
        v_service->>'service_type',
        (v_service->>'amount')::numeric,
        nullif(v_service->>'due_date', '')::date,
        nullif(v_service->>'description', '')
      );
    else
      update public.subscriptions
         set plan_name = v_service->>'service_type',
             amount = (v_service->>'amount')::numeric,
             next_billing_date = nullif(v_service->>'due_date', '')::date,
             description = nullif(v_service->>'description', ''),
             updated_at = now()
       where id = (v_service->>'id')::uuid
         and client_id = p_client_id;

      v_kept_ids := v_kept_ids || (v_service->>'id')::uuid;
    end if;
  end loop;

  delete from public.subscriptions
   where client_id = p_client_id
     and id <> all(v_kept_ids);

  return p_client_id;
end;
$$;

grant execute on function public.save_client_with_services(uuid, text, text, jsonb) to authenticated;
