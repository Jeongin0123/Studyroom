// src/components/BattleContext.tsx
import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface BattleMove {
    move_id: number;
    name: string;
    name_ko: string | null;
    power: number | null;
    pp: number | null;
    damage_class: string | null;
    slot: number;
    current_pp: number | null;
}

export interface BattleData {
    battle_id: number;
    player_a_user_pokemon_id: number;
    player_b_user_pokemon_id: number;
    player_a_moves: BattleMove[];
    player_b_moves: BattleMove[];
}

interface BattleContextType {
    battleData: BattleData | null;
    setBattleData: (data: BattleData | null) => void;
    initiatorPokemonId: number | null;
    setInitiatorPokemonId: (id: number | null) => void;
}

const BattleContext = createContext<BattleContextType | undefined>(undefined);

export function BattleProvider({ children }: { children: ReactNode }) {
    const [battleData, setBattleData] = useState<BattleData | null>(null);
    const [initiatorPokemonId, setInitiatorPokemonId] = useState<number | null>(null);

    return (
        <BattleContext.Provider
            value={{
                battleData,
                setBattleData,
                initiatorPokemonId,
                setInitiatorPokemonId,
            }}
        >
            {children}
        </BattleContext.Provider>
    );
}

export function useBattle() {
    const context = useContext(BattleContext);
    if (context === undefined) {
        throw new Error('useBattle must be used within a BattleProvider');
    }
    return context;
}
