// src/lib/pokeapi.ts
export async function getPokemon(nameOrId: string | number) {
  const r = await fetch(`/api/pokemon/pokemon/${nameOrId}`);
  if (!r.ok) throw new Error(`poke fetch ${r.status}`);
  return r.json();
}

export async function getEvolutionNames(nameOrId: string | number) {
  const sp = await fetch(`/api/pokemon/species/${nameOrId}`).then(r=>r.json());
  const id = Number(sp.evolution_chain.url.split("/").filter(Boolean).pop());
  const chain = await fetch(`/api/pokemon/evolution-chain/${id}`).then(r=>r.json());
  const names:string[] = [];
  (function walk(n:any){ names.push(n.species.name); if(n.evolves_to?.length) n.evolves_to.forEach(walk) })(chain.chain);
  return names; // ex: ["bulbasaur","ivysaur","venusaur"]
}

// 성장/페널티 이벤트
export async function postFocusEvent(params: {user_id:number; event_type:'FOCUS_PLUS'|'DROWSY'; metric:number}) {
  const r = await fetch(`/api/focus/event`, {
    method: 'POST',
    headers: {'Content-Type':'application/json'},
    body: JSON.stringify(params),
  });
  if (!r.ok) throw new Error(`focus event ${r.status}`);
  return r.json(); // {ok, stage, energy, exp, evolved}
}
