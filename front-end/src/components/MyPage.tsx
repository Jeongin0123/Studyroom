import { useState, useEffect, DragEvent } from "react";
import { Button } from "./ui/button";
import { Home } from "lucide-react";
import { useUser } from "./UserContext";
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import logoutImg from "../assets/logout.png";
import logo from "../assets/logo.png";
import bg from "../assets/bg.png";
import mycard from "../assets/mycard.png";
import slot1 from "../assets/slot1.png";
import slot2 from "../assets/slot2.png";
import slot3 from "../assets/slot3.png";
import slot4 from "../assets/slot4.png";
import slot5 from "../assets/slot5.png";
import slot6 from "../assets/slot6.png";

interface MyPageProps {
    onHome?: () => void;
    onLogout?: () => void;
    onUpdateInfo?: () => void;
    onCreatePokemon?: () => void;
}

export function MyPage({ onHome, onLogout, onUpdateInfo, onCreatePokemon }: MyPageProps) {
    const { user } = useUser();
    const [profileData, setProfileData] = useState<any>(null);
    const [pokemonTeam, setPokemonTeam] = useState<any[]>([]);
    const [allUserPokemon, setAllUserPokemon] = useState<any[]>([]);
    const [dexOrder, setDexOrder] = useState<number[]>([]);
    const [draggingTeamSlot, setDraggingTeamSlot] = useState<number | null>(null);
    const [draggingDexId, setDraggingDexId] = useState<number | null>(null);
    const [claimedExpFloor, setClaimedExpFloor] = useState<number>(-1);
    const [isLoading, setIsLoading] = useState(true);

    const fetchActiveTeam = async (userId: number) => {
        try {
            const pokemonResponse = await fetch(`/api/me/active-team?user_id=${userId}`);
            const pokemonData = await pokemonResponse.json();

            if (pokemonResponse.ok && Array.isArray(pokemonData)) {
                setPokemonTeam(pokemonData);
                return pokemonData;
            }

            console.error('포켓몬 가져오기 실패:', pokemonData);
        } catch (error) {
            console.error('포켓몬 가져오기 오류:', error);
        }

        setPokemonTeam([]);
        return [];
    };

    // Fetch user profile data and Pokemon data
    useEffect(() => {
        const fetchData = async () => {
            if (!user) {
                setProfileData(null);
                setPokemonTeam([]);
                setAllUserPokemon([]);
                setClaimedExpFloor(-1);
                return;
            }

            setIsLoading(true);
            try {
                // Fetch profile
                const profileResponse = await fetch(`/api/users/profile?user_id=${user.userId}`);
                const profileData = await profileResponse.json();

                if (profileResponse.ok) {
                    setProfileData(profileData);
                } else {
                    console.error('프로필 가져오기 실패:', profileData);
                }

                // Fetch Pokemon team (all 6 slots)
                const pokemonData = await fetchActiveTeam(user.userId);

                // Fetch all owned Pokemon (including those not in active team)
                const allResponse = await fetch(`/api/me/pokemon/all?user_id=${user.userId}`);
                const allData = await allResponse.json();

                if (allResponse.ok) {
                    setAllUserPokemon(allData);
                    const activeIds = new Set(pokemonData.map((p: any) => p.id));
                    const dexIds = allData.filter((p: any) => !activeIds.has(p.id)).map((p: any) => p.id);
                    setDexOrder(dexIds);
                } else {
                    console.error('보유 포켓몬 가져오기 실패:', allData);
                    setAllUserPokemon([]);
                }
            } catch (error) {
                console.error('데이터 가져오기 오류:', error);
                setAllUserPokemon([]);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [user]);

    // Load claimed exp floor per user
    useEffect(() => {
        if (!user || typeof window === "undefined") {
            setClaimedExpFloor(-1);
            return;
        }
        const key = `lastClaimedExpFloor:${user.userId}`;
        const stored = sessionStorage.getItem(key);
        const parsed = stored ? Number(stored) : NaN;
        setClaimedExpFloor(Number.isFinite(parsed) ? parsed : -1);
    }, [user?.userId]);

    // Pokemon team slots - use actual data or empty slots
    const studyTeamSlots = [slot1, slot2, slot3, slot4, slot5, slot6].map((slotImg, idx) => {
        const pokemon = pokemonTeam.find(p => p.slot === idx + 1);
        return {
            id: idx + 1,
            base: slotImg,
            label: pokemon?.name || "Empty",
            icon: pokemon ? `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemon.poke_id}.png` : "https://64.media.tumblr.com/tumblr_lvwmhdE0lN1qg0dcvo1_500.gif",
            level: pokemon?.level || 0,
            exp: pokemon?.exp.toLocaleString() || "0",
            isEmpty: !pokemon,
            pokeIdNumber: pokemon ? String(pokemon.poke_id).padStart(3, '0') : "",
            userPokemonId: pokemon?.id,
        };
    });

    const activeSlotSet = new Set(pokemonTeam.map(p => p.slot));
    const activeIds = new Set(pokemonTeam.map(p => p.id));
    const dexList = allUserPokemon.filter(p => !activeIds.has(p.id));
    const defaultDexOrder = dexList.map((p) => p.id);
    const orderedDexIds = (dexOrder.length ? dexOrder : defaultDexOrder).filter((id) =>
        dexList.some((p) => p.id === id)
    );
    const remainingDex = dexList.filter((p) => !orderedDexIds.includes(p.id)).map((p) => p.id);
    const finalDexIds = [...orderedDexIds, ...remainingDex];
    const extraPokemon = finalDexIds
        .map((id) => dexList.find((p) => p.id === id))
        .filter(Boolean)
        .slice(0, 24);

    const savedDexSlots = Array.from({ length: 24 }).map((_, idx) => {
        const pokemon = extraPokemon[idx];
        return {
            id: idx + 1,
            label: pokemon?.name,
            img: pokemon ? `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokemon.poke_id}.png` : undefined,
            number: pokemon ? `No.${String(pokemon.poke_id).padStart(3, '0')}` : undefined,
            userPokemonId: pokemon?.id,
        };
    });

    // Format total study time from minutes to "Xh Ym" format
    const formatStudyTime = (minutes: number) => {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return `${hours}h ${mins}m`;
    };

    const formatDateLabel = (date: string) => {
        if (!date) return "";
        const parts = date.split("-");
        return parts.length >= 3 ? `${parts[1]}/${parts[2]}` : date;
    };

    const minutesToHours = (minutes: number) => Number((minutes / 60).toFixed(2));

    // 도감 순서 유지/갱신 (팀에 있는 포켓몬 제외)
    useEffect(() => {
        if (!allUserPokemon.length) return;
        const activeIds = new Set(pokemonTeam.map((p) => p.id));
        setDexOrder((prev) => {
            const filtered = prev.filter((id) => !activeIds.has(id) && allUserPokemon.some((p) => p.id === id));
            const remaining = allUserPokemon
                .filter((p) => !activeIds.has(p.id) && !filtered.includes(p.id))
                .map((p) => p.id);
            return [...filtered, ...remaining];
        });
    }, [allUserPokemon, pokemonTeam]);

    const handleDexDragStart = (userPokemonId?: number, event?: DragEvent<HTMLElement>) => {
        if (!userPokemonId) return;
        setDraggingDexId(userPokemonId);
        if (event?.dataTransfer) {
            event.dataTransfer.effectAllowed = "move";
            event.dataTransfer.dropEffect = "move";
            event.dataTransfer.setData("text/plain", String(userPokemonId));
            event.dataTransfer.setData("application/studymon-source", "dex");
        }
    };

    const handleDexDragOver = (event: DragEvent) => {
        event.preventDefault();
        event.stopPropagation();
        if (event.dataTransfer) {
            event.dataTransfer.dropEffect = "move";
        }
    };

    const handleDexDrop = (targetId: number | undefined, event: DragEvent) => {
        event.preventDefault();
        event.stopPropagation();
        const sourceType = event.dataTransfer?.getData("application/studymon-source");
        if (draggingTeamSlot || sourceType === "team") {
            const sourceSlotId = draggingTeamSlot ?? Number(event.dataTransfer?.getData("text/plain"));
            setDraggingTeamSlot(null);
            if (!sourceSlotId) return;
            setDraggingDexId(null);
            if (targetId) {
                assignTeamSlot(sourceSlotId, targetId);
            } else {
                clearTeamSlot(sourceSlotId);
            }
            return;
        }
        if (!draggingDexId || !targetId || draggingDexId === targetId) {
            setDraggingDexId(null);
            return;
        }
        setDexOrder((prev) => {
            const ids = prev.length ? prev : dexList.map((p) => p.id);
            if (!ids.includes(draggingDexId) || !ids.includes(targetId)) return ids;
            const next = ids.map((id) => {
                if (id === draggingDexId) return targetId;
                if (id === targetId) return draggingDexId;
                return id;
            });
            return next;
        });
        setDraggingDexId(null);
    };

    const swapTeamSlots = async (fromSlot: number, toSlot: number) => {
        if (!user || fromSlot === toSlot) return;
        try {
            const response = await fetch(`/api/me/active-team/swap?user_id=${user.userId}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    from_slot: fromSlot,
                    to_slot: toSlot,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                alert(data.detail || "스터디팀 순서 변경에 실패했습니다.");
                return;
            }

            setPokemonTeam(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("스터디팀 순서 변경 오류:", error);
            alert("스터디팀 순서 변경 중 오류가 발생했습니다.");
        }
    };

    const assignTeamSlot = async (slotId: number, userPokemonId: number) => {
        if (!user) return;
        try {
            const response = await fetch(`/api/me/active-team/assign?user_id=${user.userId}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    slot: slotId,
                    user_pokemon_id: userPokemonId,
                }),
            });
            const data = await response.json();
            if (!response.ok) {
                alert(data.detail || "스터디몬 배치에 실패했습니다.");
                return;
            }
            setPokemonTeam(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("스터디몬 배치 오류:", error);
            alert("스터디몬 배치 중 오류가 발생했습니다.");
        }
    };

    const clearTeamSlot = async (slotId: number) => {
        if (!user) return;
        try {
            const response = await fetch(`/api/me/active-team/clear?user_id=${user.userId}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    slot: slotId,
                }),
            });
            const data = await response.json();
            if (!response.ok) {
                alert(data.detail || "슬롯 비우기에 실패했습니다.");
                return;
            }
            setPokemonTeam(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("슬롯 비우기 오류:", error);
            alert("슬롯 비우기 중 오류가 발생했습니다.");
        }
    };

    const handleTeamDragStart = (slotId: number, event: DragEvent<HTMLElement>) => {
        const slotInfo = studyTeamSlots.find((slot) => slot.id === slotId);
        if (!slotInfo || slotInfo.isEmpty) return;
        setDraggingTeamSlot(slotId);
        if (event.dataTransfer) {
            event.dataTransfer.effectAllowed = "move";
            event.dataTransfer.dropEffect = "move";
            event.dataTransfer.setData("text/plain", String(slotId));
            event.dataTransfer.setData("application/studymon-source", "team");
        }
    };

    const handleTeamDragOver = (event: DragEvent) => {
        event.preventDefault();
        event.stopPropagation();
        if (event.dataTransfer) {
            event.dataTransfer.dropEffect = "move";
        }
    };

    const handleTeamDrop = (targetSlotId: number, event: DragEvent) => {
        event.preventDefault();
        event.stopPropagation();
        const sourceType = event.dataTransfer?.getData("application/studymon-source");

        if (sourceType === "dex" || draggingDexId) {
            const userPokemonId = Number(event.dataTransfer?.getData("text/plain")) || draggingDexId;
            setDraggingDexId(null);
            setDraggingTeamSlot(null);
            if (!userPokemonId) return;
            assignTeamSlot(targetSlotId, userPokemonId);
            return;
        }

        const sourceSlotId = draggingTeamSlot ?? Number(event.dataTransfer?.getData("text/plain"));
        const hasSource = studyTeamSlots.some((slot) => slot.id === sourceSlotId && !slot.isEmpty);
        setDraggingTeamSlot(null);
        if (!sourceSlotId || !hasSource || sourceSlotId === targetSlotId) return;
        swapTeamSlots(sourceSlotId, targetSlotId);
    };

    // Prepare card data from API or use defaults
    const cardData = profileData ? {
        id: String(profileData.user_id).padStart(6, '0'),
        nickname: profileData.nickname,
        email: profileData.email,
        exp: profileData.exp.toLocaleString(),
        streakDays: profileData.consecutive_study_days,
        totalHours: formatStudyTime(profileData.total_focus_time),
        trainerRank: `${profileData.rank}/${profileData.total_users}`,
        dates: profileData.recent_5_days_dates || [],
        weekly: (profileData.recent_5_days_dates || []).map((date: string, idx: number) => ({
            day: date,
            avg: minutesToHours(profileData.recent_5_days_avg_focus_times[idx] || 0),
            you: minutesToHours(profileData.recent_5_days_focus_times[idx] || 0)
        }))
    } : {
        id: "000000",
        nickname: "로딩중...",
        email: "로딩중...",
        exp: "0",
        streakDays: 0,
        totalHours: "0h 0m",
        trainerRank: "N/A",
        dates: [],
        weekly: []
    };

    // 포켓몬 카드 오버레이 데이터 (첫 번째 포켓몬 사용)
    const pokemonCardData = pokemonTeam.length > 0 ? {
        id: `No.${String(pokemonTeam[0].poke_id).padStart(3, '0')}`,
        name: pokemonTeam[0].name,
        exp: pokemonTeam[0].exp.toLocaleString(),
        level: `Lv.${pokemonTeam[0].level}`,
        img: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokemonTeam[0].poke_id}.png`,
    } : {
        id: "No.000",
        name: "로딩중...",
        exp: "0",
        level: "Lv.1",
        img: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/25.png",
    };

    const cardSize = { width: 2057, height: 2816 }; // mycard.png 원본 사이즈
    const cardCoords = {
        id: { x: 1546, y: 220 },
        nickname: { x: 295, y: 500 },
        email: { x: 295, y: 750 },
        exp: { x: 295, y: 1007 },
        graph: { x: -20, y: 1500, width: 1850, height: 800 },
        achievements: {
            streak: { x: 956, y: 2400 },
            total: { x: 1363, y: 2464 },
            rank: { x: 1759, y: 2464 },
        },
    };
    const profileExp = profileData
        ? (typeof profileData.exp === "number"
            ? profileData.exp
            : Number(String(profileData.exp).replace(/,/g, "")) || 0)
        : 0;
    const expRangeStart = Math.floor(profileExp / 100) * 100;
    const expGaugeValue = Math.max(0, Math.min(100, profileExp - expRangeStart));
    const showCreateButton = profileExp >= 100 && expRangeStart > claimedExpFloor;

    const handleCreatePokemonClick = () => {
        if (typeof window !== "undefined" && user) {
            sessionStorage.setItem(`pendingClaimExpFloor:${user.userId}`, String(expRangeStart));
        }
        if (onCreatePokemon) {
            onCreatePokemon();
        }
    };

    const cardSize1 = { width: 2057, height: 2816 }; // slot.png 원본 사이즈
    const cardCoords1 = {
        pokemon: {
            id: { x: 1500, y: 520 },
            name: { x: 1500, y: 660 },
            level: { x: 1500, y: 800 },
            exp: { x: 1500, y: 940 },
            img: { x: 1500, y: 460, size: 360 },
        }
    };

    const pct = (value: number, total: number) => `${(value / total) * 100}%`;

    return (
        <div
            className="relative min-h-screen"
            style={{
                backgroundImage: `url(${bg})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
            }}
        >
            {/* 배경 데코 */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-20 left-10 w-32 h-32 bg-yellow-200/30 rounded-full blur-3xl"></div>
                <div className="absolute bottom-20 right-10 w-40 h-40 bg-blue-200/30 rounded-full blur-3xl"></div>
                <div className="absolute top-1/2 left-1/3 w-36 h-36 bg-pink-200/30 rounded-full blur-3xl"></div>
            </div>

            {/* 플로팅 컨트롤 & 로고 (랜딩 헤더 위치와 통일) */}
            <div className="absolute top-6 left-0 right-0 px-6 z-10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <button
                        className="w-12 h-12 bg-white/80 backdrop-blur-sm rounded-full border-2 border-purple-300 shadow-lg hover:bg-white hover:scale-110 transition-all flex items-center justify-center group"
                        onClick={onHome}
                    >
                        <Home className="w-5 h-5 text-purple-600 group-hover:text-purple-700" />
                    </button>
                </div>

                <img src={logo} alt="STUDYMON" className="h-14 w-auto drop-shadow-lg" />

                <button
                    className="bg-transparent hover:opacity-90 transition"
                    onClick={onLogout}
                >
                    <img src={logoutImg} alt="Logout" className="h-12 w-auto" />
                </button>
            </div>

            <main className="relative z-10 container mx-auto px-6 pt-24 pb-8">
                <div className="grid gap-6 mb-8" style={{ gridTemplateColumns: 'minmax(300px, 1fr) minmax(400px, 2fr)' }}>
                    {/* Left Section - Profile */}
                    <div>
                        <h2 className="text-purple-700 mb-4">내 정보</h2>

                        {/* 트레이너 카드 (mycard.png 오버레이) */}
                        <div
                            className="relative w-full max-w-2xl mx-auto mb-6 rounded-xl overflow-hidden shadow-xl"
                            style={{
                                backgroundImage: `url(${mycard})`,
                                backgroundSize: "cover",
                                backgroundPosition: "center",
                                aspectRatio: "768 / 1051",
                            }}
                        >
                            {/* 정보 수정 이동 버튼 (mycard 위 좌표 배치) */}
                            <div
                                className="absolute"
                                style={{
                                    left: pct(1570, cardSize.width),
                                    top: pct(970, cardSize.height),
                                }}
                            >
                                <Button
                                    size="sm"
                                    className="h-5 px-3 text-xs rounded-full bg-purple-600 text-white shadow-lg hover:bg-purple-700"
                                    onClick={onUpdateInfo}
                                >
                                    정보수정하기
                                </Button>
                            </div>

                            {/* ID (ID No. 우측) */}
                            <div
                                className="absolute text-lg font-bold text-gray-900 tracking-wide"
                                style={{
                                    left: pct(cardCoords.id.x, cardSize.width),
                                    top: pct(cardCoords.id.y, cardSize.height),
                                }}
                            >
                                {cardData.id}
                            </div>

                            {/* Basic info (좌측 초록 네모 라인과 정렬) */}
                            <div
                                className="absolute text-sm font-semibold text-gray-900 space-y-4"
                                style={{
                                    left: pct(cardCoords.nickname.x, cardSize.width),
                                    top: pct(cardCoords.nickname.y, cardSize.height),
                                }}
                            >
                                <div className="leading-tight">NICKNAME: {cardData.nickname}</div>
                                <div className="leading-tight" style={{ marginTop: "20px" }}>EMAIL: {cardData.email}</div>
                                <div className="leading-tight" style={{ marginTop: "20px" }}>
                                    EXP: {cardData.exp}
                                    <div className="mt-2 flex items-center gap-3">
                                        <div className="w-44 h-2.5 bg-white/70 rounded-full overflow-hidden border border-purple-200 shadow-sm">
                                            <div
                                                className="h-full bg-gradient-to-r from-purple-400 to-pink-400"
                                                style={{ width: `${expGaugeValue}%` }}
                                            />
                                        </div>
                                        {showCreateButton && (
                                            <Button
                                                size="sm"
                                                className="h-5 px-3 text-xs rounded-full bg-pink-600 text-white shadow-lg hover:bg-pink-700"
                                                onClick={handleCreatePokemonClick}
                                            >
                                                새 스터디몬!
                                            </Button>
                                        )}
                                    </div>
                                    <div className="text-[11px] text-gray-700 mt-1">
                                        현재 경험치: {expRangeStart + expGaugeValue} / {expRangeStart + 100}
                                    </div>
                                </div>
                            </div>

                            {/* 최근 5일 공부 시간 그래프 */}
                            <div
                                className="absolute rounded-xl"
                                style={{
                                    left: pct(cardCoords.graph.x, cardSize.width),
                                    top: pct(cardCoords.graph.y, cardSize.height),
                                    width: pct(cardCoords.graph.width, cardSize.width),
                                    height: pct(cardCoords.graph.height, cardSize.height),
                                }}
                            >
                                {cardData.weekly.length > 0 ? (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={cardData.weekly} margin={{ top: 20, right: 20, bottom: 20, left: 30 }}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#e9d8fd" />
                                            <XAxis
                                                dataKey="day"
                                                tickFormatter={formatDateLabel}
                                                stroke="#7c3aed"
                                                tick={{ fontSize: 12 }}
                                            />
                                            <YAxis
                                                tick={{ fontSize: 12 }}
                                                stroke="#7c3aed"
                                                tickFormatter={(value: number) => `${value}시간`}
                                            />
                                            <Tooltip formatter={(value: number) => `${value} 시간`} labelFormatter={(label) => `날짜: ${label}`} />
                                            <Legend />
                                            <Line type="linear" dataKey="you" name="내 공부시간" stroke="#7c3aed" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                                            <Line type="linear" dataKey="avg" name="평균" stroke="#fb7185" strokeWidth={2} strokeDasharray="4 2" dot={{ r: 3 }} />
                                        </LineChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-sm text-purple-700">
                                        최근 5일 공부 기록이 없습니다.
                                    </div>
                                )}
                            </div>
                            {/* Achievements row (하단 흰색 두 줄 사이) */}
                            <div
                                className="absolute left-0 right-0 text-xs font-semibold text-gray-900"
                                style={{
                                    top: pct(cardCoords.achievements.streak.y, cardSize.height),
                                }}
                            >
                                <div className="relative w-full">
                                    <div
                                        className="absolute text-center"
                                        style={{
                                            left: pct(cardCoords.achievements.streak.x, cardSize.width),
                                            transform: "translateX(-50%)",
                                        }}
                                    >
                                        <div className="mb-1">연속 학습 일수</div>
                                        <div className="text-base">{cardData.streakDays}일</div>
                                    </div>
                                    <div
                                        className="absolute text-center"
                                        style={{
                                            left: pct(cardCoords.achievements.total.x, cardSize.width),
                                            transform: "translateX(-50%)",
                                        }}
                                    >
                                        <div className="mb-1">누적 공부 시간</div>
                                        <div className="text-base">{cardData.totalHours}</div>
                                    </div>
                                    <div
                                        className="absolute text-center"
                                        style={{
                                            left: pct(cardCoords.achievements.rank.x, cardSize.width),
                                            transform: "translateX(-50%)",
                                        }}
                                    >
                                        <div className="mb-1">트레이너 등수</div>
                                        <div className="text-base">{cardData.trainerRank}</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Section - My Pokemon */}
                    <div>
                        <h2 className="text-purple-700 mb-2">내 스터디팀</h2>
                        <div className="grid grid-cols-3 gap-x-3 gap-y-1">
                            {studyTeamSlots.map((slot) => (
                                <div
                                    key={slot.id}
                                    className="w-full flex flex-col items-center relative"
                                    style={{ aspectRatio: "1" }}
                                    draggable={!slot.isEmpty}
                                    onDragStart={(e) => handleTeamDragStart(slot.id, e)}
                                    onDragOver={handleTeamDragOver}
                                    onDragEnter={handleTeamDragOver}
                                    onDrop={(e) => handleTeamDrop(slot.id, e)}
                                >
                                    <img
                                        src={slot.base}
                                        alt={slot.label}
                                        className="w-full h-full object-contain"
                                    />
                                    {/* Pokemon ID Overlay */}
                                    {!slot.isEmpty && (
                                        <div
                                            className="absolute text-[13px] font-bold text-gray-800"
                                            style={{
                                                top: "13%",
                                                right: "18%",
                                            }}
                                        >
                                            {slot.pokeIdNumber}
                                        </div>
                                    )}
                                    <div
                                        className="absolute inset-0 flex justify-center"
                                        style={{ paddingTop: slot.isEmpty ? "18%" : "25%" }}
                                    >
                                        <img
                                            src={slot.icon}
                                            alt={`${slot.label} icon`}
                                            className="w-[70%] h-[70%] object-contain"
                                            style={slot.isEmpty ? { transform: "translateY(-30px)" } : undefined}
                                        />
                                    </div>
                                    <div
                                        className="absolute inset-x-1 bottom-3 bg-white/80 text-[10px] font-semibold text-purple-700 rounded-md px-2 py-1 text-center leading-tight"
                                        style={{ transform: "translateY(-20%)" }}
                                    >
                                        <div>{slot.label}</div>
                                        <div className="text-[10px] font-semibold text-gray-700">Lv.{slot.level} • EXP {slot.exp}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <p className="mt-3 text-sm font-bold text-purple-700 text-center">
                            내 스터디몬 도감에서 데려갈 수 있는 스터디몬은 최대 6명입니다! 드래그 앤 드롭을 통해 데려오고, 다시 저장할 수 있어요!
                        </p>
                    </div>
                </div>

                {/* Saved Pokemon Section */}
                <div>
                    <h2 className="text-purple-700 mb-3">내 스터디몬 도감</h2>
                    <div className="grid grid-cols-6 gap-3">
                        {savedDexSlots.map((slot) => (
                            <div
                                key={slot.id}
                                className="relative w-full border border-purple-100 rounded-xl bg-white/80 backdrop-blur-sm shadow-sm"
                                style={{ aspectRatio: "1" }}
                                draggable={!!slot.userPokemonId}
                                onDragStart={(e) => handleDexDragStart(slot.userPokemonId, e)}
                                onDragOver={handleDexDragOver}
                                onDragEnter={handleDexDragOver}
                                onDrop={(e) => handleDexDrop(slot.userPokemonId, e)}
                            >
                                {slot.img ? (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center p-2">
                                        <img src={slot.img} alt={slot.label} className="w-3/4 h-3/4 object-contain" />
                                        <p className="mt-1 text-[11px] font-semibold text-purple-700 text-center">{slot.label}</p>
                                        <p className="text-[10px] text-gray-600">{slot.number}</p>
                                    </div>
                                ) : (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400 text-[11px]">
                                        <div className="w-10 h-10 rounded-full border border-dashed border-gray-300 mb-1"></div>
                                        <span>EMPTY</span>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </main >

        </div >
    );
}
