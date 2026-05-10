'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import { api } from '@/lib/api';
import { formatDate as fmt } from '@/lib/date';
import toast from 'react-hot-toast';
import RoleGuard from '@/components/RoleGuard';

/* ─── Types ────────────────────────────────────────────────── */

interface Tournament {
  id: string;
  name: string;
  sport: 'PADEL' | 'TENNIS';
  status: string;
  description?: string;
  maxTeams?: number;
  startDate?: string;
  endDate?: string;
  registrationEnd?: string;
  pointsPerWin?: number;
  pointsPerLoss?: number;
  rules?: string;
  club?: { id: string; name: string };
  teams?: Team[];
  groups?: Group[];
  brackets?: Bracket[];
}

interface Team {
  id: string;
  name: string;
  seed?: number;
  players?: { id: string; user: { id: string; firstName: string; lastName: string; email: string } }[];
}

interface Group {
  id: string;
  name: string;
  qualifyCount: number;
  isFinalized?: boolean;
  categoryId?: string;
  members?: GroupMember[];
}

interface GroupMember {
  id: string;
  position?: number;
  isQualified?: boolean;
  manualOverride?: boolean;
  matchesPlayed: number;
  matchesWon: number;
  matchesLost: number;
  setsWon: number;
  setsLost: number;
  gamesWon: number;
  gamesLost: number;
  points: number;
  team?: { id: string; name: string };
}

interface GroupMatch {
  id: string;
  homeTeam?: { id: string; name: string };
  awayTeam?: { id: string; name: string };
  homeTeamId?: string;
  awayTeamId?: string;
  winnerId?: string;
  status: string;
  sets?: MatchSet[];
}

interface MatchSet {
  setNumber: number;
  homeScore: number;
  awayScore: number;
}

interface Bracket {
  id: string;
  round: string;
  position: number;
  homeTeam?: { id: string; name: string };
  awayTeam?: { id: string; name: string };
  homeTeamId?: string;
  awayTeamId?: string;
  winnerId?: string;
  isLocked?: boolean;
  isBye?: boolean;
  homeScore?: number;
  awayScore?: number;
  sets?: MatchSet[];
  matchId?: string;
}

interface SearchUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

/* ─── Helpers ──────────────────────────────────────────────── */

function Spinner({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg className={`animate-spin ${className}`} viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}

const STATUS_OPTIONS = [
  { value: 'DRAFT', label: 'Borrador' },
  { value: 'REGISTRATION', label: 'Inscripcion' },
  { value: 'GROUP_STAGE', label: 'Fase de grupos' },
  { value: 'ELIMINATION', label: 'Llave eliminatoria' },
  { value: 'COMPLETED', label: 'Finalizado' },
  { value: 'CANCELLED', label: 'Cancelado' },
];

const statusBadgeClass = (s: string) => {
  switch (s) {
    case 'DRAFT': return 'badge-neutral';
    case 'REGISTRATION': return 'badge-yellow';
    case 'GROUP_STAGE': return 'badge-green';
    case 'ELIMINATION': return 'badge-padel';
    case 'COMPLETED': return 'badge-brand';
    case 'CANCELLED': return 'badge-red';
    default: return 'badge-neutral';
  }
};

const statusLabel = (s: string) => STATUS_OPTIONS.find(o => o.value === s)?.label || s;

const roundLabel = (round: string) =>
  round
    .replace(/_/g, ' ')
    .replace(/ROUND OF (\d+)/i, 'Ronda de $1')
    .replace(/QUARTER.?FINALS?/i, 'Cuartos de final')
    .replace(/SEMI.?FINALS?/i, 'Semifinal')
    .replace(/^FINAL$/i, 'Final');

/* ═════════════════════════════════════════════════════════════
   MODAL WRAPPER
   ═════════════════════════════════════════════════════════════ */

function Modal({ onClose, children, title }: { onClose: () => void; children: React.ReactNode; title: string }) {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in" onClick={onClose}>
      <div className="glass-dark max-w-lg w-full p-8 animate-scale-in max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">{title}</h2>
          <button onClick={onClose} className="btn-icon-sm" aria-label="Cerrar">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

/* ═════════════════════════════════════════════════════════════
   ADD TEAM MODAL
   ═════════════════════════════════════════════════════════════ */

function AddTeamModal({
  tournamentId,
  onClose,
  onCreated,
}: {
  tournamentId: string;
  onClose: () => void;
  onCreated: () => void;
}) {
  const [teamName, setTeamName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchUser[]>([]);
  const [searching, setSearching] = useState(false);
  const [selectedPlayers, setSelectedPlayers] = useState<SearchUser[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const searchTimeout = useRef<NodeJS.Timeout | null>(null);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    if (!query.trim() || query.trim().length < 2) {
      setSearchResults([]);
      return;
    }
    searchTimeout.current = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await api.get(`/users/search?search=${encodeURIComponent(query.trim())}`);
        setSearchResults(Array.isArray(res) ? res : res.users || []);
      } catch {
        setSearchResults([]);
      } finally {
        setSearching(false);
      }
    }, 350);
  };

  const addPlayer = (user: SearchUser) => {
    if (selectedPlayers.length >= 2) {
      toast.error('Maximo 2 jugadores por equipo');
      return;
    }
    if (selectedPlayers.find(p => p.id === user.id)) {
      toast.error('Este jugador ya fue agregado');
      return;
    }
    setSelectedPlayers(prev => [...prev, user]);
    setSearchQuery('');
    setSearchResults([]);
  };

  const removePlayer = (userId: string) => {
    setSelectedPlayers(prev => prev.filter(p => p.id !== userId));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!teamName.trim()) { toast.error('Ingresa un nombre de equipo'); return; }
    if (selectedPlayers.length === 0) { toast.error('Agrega al menos un jugador'); return; }
    setSubmitting(true);
    try {
      await api.post(`/tournaments/${tournamentId}/teams`, {
        name: teamName.trim(),
        playerIds: selectedPlayers.map(p => p.id),
      });
      toast.success('Equipo agregado!');
      onCreated();
      onClose();
    } catch (err: any) {
      toast.error(err.message || 'Error al agregar equipo');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal onClose={onClose} title="Agregar equipo">
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Team name */}
        <div>
          <label className="label">Nombre del equipo</label>
          <input
            className="input"
            value={teamName}
            onChange={e => setTeamName(e.target.value)}
            placeholder="Ej: Los Cracks"
          />
        </div>

        {/* Selected players */}
        {selectedPlayers.length > 0 && (
          <div>
            <label className="label">Jugadores seleccionados</label>
            <div className="space-y-2">
              {selectedPlayers.map(p => (
                <div key={p.id} className="flex items-center justify-between p-3 bg-surface-light rounded-xl border border-border-dark">
                  <div>
                    <span className="text-white font-medium">{p.firstName} {p.lastName}</span>
                    <span className="text-text-muted text-sm ml-2">{p.email}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => removePlayer(p.id)}
                    className="text-text-muted hover:text-red-400 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Player search */}
        {selectedPlayers.length < 2 && (
          <div>
            <label className="label">Buscar jugador ({selectedPlayers.length}/2)</label>
            <div className="relative">
              <input
                className="input-search"
                value={searchQuery}
                onChange={e => handleSearch(e.target.value)}
                placeholder="Buscar por nombre o email..."
              />
              {searching && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <Spinner className="h-4 w-4 text-text-muted" />
                </div>
              )}
            </div>
            {/* Results dropdown */}
            {searchResults.length > 0 && (
              <div className="mt-2 bg-surface-light rounded-xl border border-border-dark max-h-48 overflow-y-auto">
                {searchResults.map(u => (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => addPlayer(u)}
                    className="w-full text-left px-4 py-3 hover:bg-surface-hover transition-colors border-b border-border-dark/50 last:border-b-0"
                  >
                    <span className="text-white font-medium">{u.firstName} {u.lastName}</span>
                    <span className="text-text-muted text-sm ml-2">{u.email}</span>
                  </button>
                ))}
              </div>
            )}
            {searchQuery.trim().length >= 2 && !searching && searchResults.length === 0 && (
              <p className="text-text-muted text-sm mt-2">No se encontraron jugadores</p>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <button type="submit" className="btn-primary flex-1" disabled={submitting}>
            {submitting ? (
              <span className="flex items-center justify-center gap-2"><Spinner /> Agregando...</span>
            ) : (
              'Agregar equipo'
            )}
          </button>
          <button type="button" onClick={onClose} className="btn-secondary flex-1">
            Cancelar
          </button>
        </div>
      </form>
    </Modal>
  );
}

/* ═════════════════════════════════════════════════════════════
   GENERATE GROUPS MODAL
   ═════════════════════════════════════════════════════════════ */

function GenerateGroupsModal({
  tournamentId,
  onClose,
  onGenerated,
}: {
  tournamentId: string;
  onClose: () => void;
  onGenerated: () => void;
}) {
  const [numberOfGroups, setNumberOfGroups] = useState('2');
  const [qualifyPerGroup, setQualifyPerGroup] = useState('2');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const numGroups = parseInt(numberOfGroups);
    const qualifyPer = parseInt(qualifyPerGroup);
    if (numGroups < 1) { toast.error('Minimo 1 zona'); return; }
    if (qualifyPer < 1) { toast.error('Minimo 1 clasificado por zona'); return; }
    setSubmitting(true);
    try {
      await api.post(`/tournaments/${tournamentId}/generate-groups`, {
        numberOfGroups: numGroups,
        qualifyPerGroup: qualifyPer,
      });
      toast.success('Zonas generadas correctamente!');
      onGenerated();
      onClose();
    } catch (err: any) {
      toast.error(err.message || 'Error al generar zonas');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal onClose={onClose} title="Generar zonas">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="label">Cantidad de zonas</label>
          <input
            className="input"
            type="number"
            min="1"
            max="16"
            value={numberOfGroups}
            onChange={e => setNumberOfGroups(e.target.value)}
          />
          <p className="text-xs text-text-muted mt-1">Los equipos se distribuyen automaticamente</p>
        </div>

        <div>
          <label className="label">Clasificados por zona</label>
          <input
            className="input"
            type="number"
            min="1"
            max="8"
            value={qualifyPerGroup}
            onChange={e => setQualifyPerGroup(e.target.value)}
          />
          <p className="text-xs text-text-muted mt-1">Equipos que pasan a la llave eliminatoria</p>
        </div>

        <div className="flex gap-3 pt-2">
          <button type="submit" className="btn-primary flex-1" disabled={submitting}>
            {submitting ? (
              <span className="flex items-center justify-center gap-2"><Spinner /> Generando...</span>
            ) : (
              'Generar zonas'
            )}
          </button>
          <button type="button" onClick={onClose} className="btn-secondary flex-1">
            Cancelar
          </button>
        </div>
      </form>
    </Modal>
  );
}

/* ═════════════════════════════════════════════════════════════
   MATCH RESULT MODAL
   ═════════════════════════════════════════════════════════════ */

function MatchResultModal({
  tournamentId,
  match,
  onClose,
  onSaved,
}: {
  tournamentId: string;
  match: { matchId: string; homeTeamName: string; awayTeamName: string; homeTeamId: string; awayTeamId: string };
  onClose: () => void;
  onSaved: () => void;
}) {
  const [sets, setSets] = useState<{ homeScore: string; awayScore: string }[]>([
    { homeScore: '', awayScore: '' },
    { homeScore: '', awayScore: '' },
    { homeScore: '', awayScore: '' },
  ]);
  const [isWalkover, setIsWalkover] = useState(false);
  const [walkoverId, setWalkoverId] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSetChange = (idx: number, side: 'homeScore' | 'awayScore', val: string) => {
    setSets(prev => {
      const updated = [...prev];
      updated[idx] = { ...updated[idx], [side]: val };
      return updated;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (isWalkover) {
        if (!walkoverId) { toast.error('Selecciona el equipo ganador del walkover'); setSubmitting(false); return; }
        await api.post(`/tournaments/${tournamentId}/matches/${match.matchId}/result`, {
          winnerId: walkoverId,
          isWalkover: true,
          sets: [],
        });
      } else {
        // Build sets array, only include filled-in sets
        const filledSets = sets
          .map((s, i) => ({
            setNumber: i + 1,
            homeScore: parseInt(s.homeScore),
            awayScore: parseInt(s.awayScore),
          }))
          .filter(s => !isNaN(s.homeScore) && !isNaN(s.awayScore));

        if (filledSets.length === 0) {
          toast.error('Ingresa al menos un set');
          setSubmitting(false);
          return;
        }

        // Auto-calculate winner: who won more sets
        let homeWins = 0;
        let awayWins = 0;
        filledSets.forEach(s => {
          if (s.homeScore > s.awayScore) homeWins++;
          else if (s.awayScore > s.homeScore) awayWins++;
        });

        const winnerId = homeWins > awayWins ? match.homeTeamId : match.awayTeamId;

        await api.post(`/tournaments/${tournamentId}/matches/${match.matchId}/result`, {
          winnerId,
          isWalkover: false,
          sets: filledSets,
        });
      }
      toast.success('Resultado cargado!');
      onSaved();
      onClose();
    } catch (err: any) {
      toast.error(err.message || 'Error al cargar resultado');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal onClose={onClose} title="Cargar resultado">
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Match header */}
        <div className="flex items-center justify-center gap-4 p-4 bg-surface-light rounded-xl border border-border-dark">
          <span className="text-white font-bold text-center flex-1">{match.homeTeamName}</span>
          <span className="text-text-muted text-sm font-medium">vs</span>
          <span className="text-white font-bold text-center flex-1">{match.awayTeamName}</span>
        </div>

        {/* Walkover toggle */}
        <label className="flex items-center gap-3 cursor-pointer group">
          <button
            type="button"
            role="switch"
            aria-checked={isWalkover}
            onClick={() => setIsWalkover(!isWalkover)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${
              isWalkover ? 'bg-brand' : 'bg-surface-light border border-border-dark'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full transition-transform duration-200 ${
                isWalkover ? 'translate-x-6 bg-black' : 'translate-x-1 bg-text-muted'
              }`}
            />
          </button>
          <span className="text-sm text-text-secondary group-hover:text-white transition-colors">Walkover</span>
        </label>

        {isWalkover ? (
          <div>
            <label className="label">Ganador del walkover</label>
            <select
              className="input appearance-none cursor-pointer"
              value={walkoverId}
              onChange={e => setWalkoverId(e.target.value)}
            >
              <option value="">Seleccionar ganador</option>
              <option value={match.homeTeamId}>{match.homeTeamName}</option>
              <option value={match.awayTeamId}>{match.awayTeamName}</option>
            </select>
          </div>
        ) : (
          <div className="space-y-3">
            <label className="label">Sets (completar los jugados)</label>
            {sets.map((set, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="text-text-muted text-sm font-medium w-12">Set {i + 1}</span>
                <input
                  className="input text-center w-20"
                  type="number"
                  min="0"
                  max="99"
                  value={set.homeScore}
                  onChange={e => handleSetChange(i, 'homeScore', e.target.value)}
                  placeholder="-"
                />
                <span className="text-text-muted">-</span>
                <input
                  className="input text-center w-20"
                  type="number"
                  min="0"
                  max="99"
                  value={set.awayScore}
                  onChange={e => handleSetChange(i, 'awayScore', e.target.value)}
                  placeholder="-"
                />
              </div>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <button type="submit" className="btn-primary flex-1" disabled={submitting}>
            {submitting ? (
              <span className="flex items-center justify-center gap-2"><Spinner /> Guardando...</span>
            ) : (
              'Guardar resultado'
            )}
          </button>
          <button type="button" onClick={onClose} className="btn-secondary flex-1">
            Cancelar
          </button>
        </div>
      </form>
    </Modal>
  );
}

/* ═════════════════════════════════════════════════════════════
   TAB: EQUIPOS
   ═════════════════════════════════════════════════════════════ */

function TeamsTab({ tournament, onRefresh }: { tournament: Tournament; onRefresh: () => void }) {
  const [showAddTeam, setShowAddTeam] = useState(false);
  const teams = tournament.teams || [];

  return (
    <div className="animate-fade-in-up">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-white">
          Equipos
          <span className="text-text-muted font-normal ml-2">({teams.length}{tournament.maxTeams ? `/${tournament.maxTeams}` : ''})</span>
        </h3>
        <button onClick={() => setShowAddTeam(true)} className="btn-primary">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Agregar equipo
        </button>
      </div>

      {teams.length === 0 ? (
        <div className="card-elevated text-center py-12">
          <div className="w-16 h-16 rounded-full bg-surface-light flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-text-muted opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-text-secondary mb-2">Sin equipos</h3>
          <p className="text-text-muted mb-4">Agrega equipos para comenzar el torneo</p>
          <button onClick={() => setShowAddTeam(true)} className="btn-primary">
            Agregar primer equipo
          </button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {teams.map((team, i) => (
            <div
              key={team.id}
              className="card-glow animate-fade-in-up"
              style={{ animationDelay: `${i * 50}ms` }}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-brand/10 flex items-center justify-center text-brand font-bold text-sm flex-shrink-0">
                  {team.seed || team.name?.[0] || '#'}
                </div>
                <div className="min-w-0">
                  <h4 className="font-bold text-white truncate">{team.name}</h4>
                  <p className="text-xs text-text-muted truncate">
                    {team.players && team.players.length > 0
                      ? team.players.map(p => `${p.user.firstName} ${p.user.lastName}`).join(' / ')
                      : 'Sin jugadores'
                    }
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showAddTeam && (
        <AddTeamModal
          tournamentId={tournament.id}
          onClose={() => setShowAddTeam(false)}
          onCreated={onRefresh}
        />
      )}
    </div>
  );
}

/* ═════════════════════════════════════════════════════════════
   TAB: ZONAS
   ═════════════════════════════════════════════════════════════ */

function GroupsTab({ tournament, onRefresh }: { tournament: Tournament; onRefresh: () => void }) {
  const router = useRouter();
  const [openingScoreboard, setOpeningScoreboard] = useState<string | null>(null);
  const [showGenerateGroups, setShowGenerateGroups] = useState(false);
  const [groupMatches, setGroupMatches] = useState<Record<string, GroupMatch[]>>({});
  const [groupStandings, setGroupStandings] = useState<Record<string, GroupMember[]>>({});
  const [loadingMatches, setLoadingMatches] = useState<Record<string, boolean>>({});
  const [activeMatch, setActiveMatch] = useState<{ matchId: string; homeTeamName: string; awayTeamName: string; homeTeamId: string; awayTeamId: string } | null>(null);
  const [finalizingGroup, setFinalizingGroup] = useState<string | null>(null);

  const openOfficialScoreboard = async (
    tournamentMatchId: string,
    homeLabel: string,
    awayLabel: string,
  ) => {
    setOpeningScoreboard(tournamentMatchId);
    try {
      // Reuse existing scoreboard for this match if any, else create a new official one.
      const peers = await api.get<{ official: any; mine: any }>(
        `/scoreboards/by-tournament-match/${tournamentMatchId}`,
      ).catch(() => ({ official: null, mine: null }));
      let id = peers.official?.id;
      if (!id) {
        const created = await api.post<any>('/scoreboards', {
          sport: tournament.sport,
          homeLabel, awayLabel,
          isOfficial: true,
          tournamentMatchId,
          totalSets: 3,
          scoringMode: 'STANDARD',
        });
        id = created.id;
      }
      router.push(`/scoreboard/${id}`);
    } catch (err: any) {
      toast.error(err.message || 'Error al abrir anotador');
    } finally {
      setOpeningScoreboard(null);
    }
  };

  const groups = tournament.groups || [];

  const loadGroupData = useCallback(async (groupId: string) => {
    setLoadingMatches(prev => ({ ...prev, [groupId]: true }));
    try {
      const [matches, standings] = await Promise.all([
        api.get<GroupMatch[]>(`/tournaments/${tournament.id}/groups/${groupId}/matches`),
        api.get<GroupMember[]>(`/tournaments/${tournament.id}/groups/${groupId}/standings`),
      ]);
      setGroupMatches(prev => ({ ...prev, [groupId]: Array.isArray(matches) ? matches : [] }));
      setGroupStandings(prev => ({ ...prev, [groupId]: Array.isArray(standings) ? standings : [] }));
    } catch (err: any) {
      // standings might not be available yet, that's OK
      try {
        const matches = await api.get<GroupMatch[]>(`/tournaments/${tournament.id}/groups/${groupId}/matches`);
        setGroupMatches(prev => ({ ...prev, [groupId]: Array.isArray(matches) ? matches : [] }));
      } catch {
        // ignore
      }
    } finally {
      setLoadingMatches(prev => ({ ...prev, [groupId]: false }));
    }
  }, [tournament.id]);

  useEffect(() => {
    groups.forEach(g => loadGroupData(g.id));
  }, [groups.length, loadGroupData]);

  const handleFinalizeGroup = async (groupId: string) => {
    setFinalizingGroup(groupId);
    try {
      await api.patch(`/tournaments/${tournament.id}/groups/${groupId}/finalize`);
      toast.success('Zona finalizada!');
      onRefresh();
    } catch (err: any) {
      toast.error(err.message || 'Error al finalizar zona');
    } finally {
      setFinalizingGroup(null);
    }
  };

  return (
    <div className="animate-fade-in-up">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-white">
          Zonas
          <span className="text-text-muted font-normal ml-2">({groups.length})</span>
        </h3>
        {groups.length === 0 && (tournament.teams?.length || 0) >= 2 && (
          <button onClick={() => setShowGenerateGroups(true)} className="btn-primary">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
            Generar zonas
          </button>
        )}
      </div>

      {groups.length === 0 ? (
        <div className="card-elevated text-center py-12">
          <div className="w-16 h-16 rounded-full bg-surface-light flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-text-muted opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-text-secondary mb-2">Sin zonas</h3>
          <p className="text-text-muted mb-4">
            {(tournament.teams?.length || 0) < 2
              ? 'Necesitas al menos 2 equipos para generar zonas'
              : 'Genera las zonas para organizar la fase de grupos'
            }
          </p>
          {(tournament.teams?.length || 0) >= 2 && (
            <button onClick={() => setShowGenerateGroups(true)} className="btn-primary">
              Generar zonas
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-8">
          {groups.map(group => {
            const matches = groupMatches[group.id] || [];
            const standings = groupStandings[group.id] || group.members || [];
            const isLoading = loadingMatches[group.id];

            return (
              <div key={group.id} className="card-elevated overflow-hidden">
                {/* Group header */}
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-bold text-white flex items-center gap-2">
                    {group.name}
                    {group.isFinalized && (
                      <span className="badge-brand text-xs">Finalizada</span>
                    )}
                  </h4>
                  <div className="flex items-center gap-2">
                    <span className="badge-neutral">{group.members?.length || 0} equipos</span>
                    <span className="badge-green">Clasifican: {group.qualifyCount}</span>
                    {!group.isFinalized && (
                      <button
                        onClick={() => handleFinalizeGroup(group.id)}
                        disabled={finalizingGroup === group.id}
                        className="btn-ghost text-xs"
                      >
                        {finalizingGroup === group.id ? (
                          <span className="flex items-center gap-1"><Spinner className="h-3 w-3" /> Finalizando...</span>
                        ) : (
                          'Finalizar zona'
                        )}
                      </button>
                    )}
                  </div>
                </div>

                {/* Standings table */}
                {standings.length > 0 && (
                  <div className="overflow-x-auto mb-6">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border-dark text-left">
                          <th className="py-3 pr-3 text-text-muted font-medium text-xs uppercase tracking-wider w-8">#</th>
                          <th className="py-3 pr-3 text-text-muted font-medium text-xs uppercase tracking-wider">Equipo</th>
                          <th className="py-3 px-2 text-center text-text-muted font-medium text-xs uppercase tracking-wider">PJ</th>
                          <th className="py-3 px-2 text-center text-text-muted font-medium text-xs uppercase tracking-wider">G</th>
                          <th className="py-3 px-2 text-center text-text-muted font-medium text-xs uppercase tracking-wider">P</th>
                          <th className="py-3 px-2 text-center text-text-muted font-medium text-xs uppercase tracking-wider">SF</th>
                          <th className="py-3 px-2 text-center text-text-muted font-medium text-xs uppercase tracking-wider">SC</th>
                          <th className="py-3 px-2 text-center text-text-muted font-medium text-xs uppercase tracking-wider">GF</th>
                          <th className="py-3 px-2 text-center text-text-muted font-medium text-xs uppercase tracking-wider">GC</th>
                          <th className="py-3 pl-2 text-center text-brand font-bold text-xs uppercase tracking-wider">Pts</th>
                        </tr>
                      </thead>
                      <tbody>
                        {standings.map((m, i) => (
                          <tr
                            key={m.id || i}
                            className={`border-b border-border-dark/50 transition-colors hover:bg-surface-light/50 ${
                              m.isQualified ? 'bg-brand/[0.05]' : ''
                            }`}
                          >
                            <td className="py-3 pr-3">
                              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                                m.isQualified
                                  ? 'bg-brand/20 text-brand'
                                  : 'bg-surface-light text-text-muted'
                              }`}>
                                {m.position || i + 1}
                              </div>
                            </td>
                            <td className="py-3 pr-3">
                              <div className="flex items-center gap-2">
                                <span className={`font-semibold ${m.isQualified ? 'text-brand' : 'text-white'}`}>
                                  {m.team?.name}
                                </span>
                                {m.isQualified && (
                                  <svg className="w-4 h-4 text-brand" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                  </svg>
                                )}
                                {m.manualOverride && (
                                  <span className="text-xs text-yellow-400">manual</span>
                                )}
                              </div>
                            </td>
                            <td className="py-3 px-2 text-center text-text-secondary">{m.matchesPlayed}</td>
                            <td className="py-3 px-2 text-center text-brand font-medium">{m.matchesWon}</td>
                            <td className="py-3 px-2 text-center text-red-400 font-medium">{m.matchesLost}</td>
                            <td className="py-3 px-2 text-center text-text-secondary">{m.setsWon}</td>
                            <td className="py-3 px-2 text-center text-text-secondary">{m.setsLost}</td>
                            <td className="py-3 px-2 text-center text-text-secondary">{m.gamesWon}</td>
                            <td className="py-3 px-2 text-center text-text-secondary">{m.gamesLost}</td>
                            <td className="py-3 pl-2 text-center font-bold text-white text-lg">{m.points}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Matches */}
                {isLoading ? (
                  <div className="flex items-center gap-2 text-text-muted py-4">
                    <Spinner className="h-4 w-4" /> Cargando partidos...
                  </div>
                ) : matches.length > 0 ? (
                  <div>
                    <h5 className="text-sm font-semibold text-text-muted uppercase tracking-wider mb-3">Partidos</h5>
                    <div className="space-y-2">
                      {matches.map(match => {
                        const homeName = match.homeTeam?.name || 'TBD';
                        const awayName = match.awayTeam?.name || 'TBD';
                        const hasResult = !!match.winnerId;

                        return (
                          <div
                            key={match.id}
                            className={`flex items-center justify-between p-3 rounded-xl border transition-colors ${
                              hasResult
                                ? 'bg-surface-light/50 border-border-dark/50'
                                : 'bg-surface-light border-border-dark'
                            }`}
                          >
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                              <span className={`font-medium truncate ${
                                match.winnerId === match.homeTeamId ? 'text-brand font-bold' : 'text-white'
                              }`}>
                                {homeName}
                              </span>

                              {hasResult && match.sets && match.sets.length > 0 ? (
                                <div className="flex items-center gap-1.5 flex-shrink-0">
                                  {match.sets.map((s, si) => (
                                    <span key={si} className="text-xs font-mono bg-surface rounded px-1.5 py-0.5 text-text-secondary border border-border-dark">
                                      {s.homeScore}-{s.awayScore}
                                    </span>
                                  ))}
                                </div>
                              ) : (
                                <span className="text-text-muted text-sm flex-shrink-0">vs</span>
                              )}

                              <span className={`font-medium truncate ${
                                match.winnerId === match.awayTeamId ? 'text-brand font-bold' : 'text-white'
                              }`}>
                                {awayName}
                              </span>
                            </div>

                            <div className="flex items-center gap-2 ml-2 flex-shrink-0">
                              {match.homeTeamId && match.awayTeamId && (
                                <button
                                  onClick={() => openOfficialScoreboard(match.id, homeName, awayName)}
                                  disabled={openingScoreboard === match.id}
                                  className="btn-secondary text-xs"
                                  title="Abrir anotador oficial"
                                >
                                  {openingScoreboard === match.id ? '…' : '🎯 Anotador'}
                                </button>
                              )}
                              {!hasResult && match.homeTeamId && match.awayTeamId && (
                                <button
                                  onClick={() => setActiveMatch({
                                    matchId: match.id,
                                    homeTeamName: homeName,
                                    awayTeamName: awayName,
                                    homeTeamId: match.homeTeamId!,
                                    awayTeamId: match.awayTeamId!,
                                  })}
                                  className="btn-secondary text-xs"
                                >
                                  Cargar resultado
                                </button>
                              )}
                              {hasResult && (
                                <span className="badge-green text-xs">Jugado</span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      )}

      {showGenerateGroups && (
        <GenerateGroupsModal
          tournamentId={tournament.id}
          onClose={() => setShowGenerateGroups(false)}
          onGenerated={onRefresh}
        />
      )}

      {activeMatch && (
        <MatchResultModal
          tournamentId={tournament.id}
          match={activeMatch}
          onClose={() => setActiveMatch(null)}
          onSaved={() => {
            groups.forEach(g => loadGroupData(g.id));
            onRefresh();
          }}
        />
      )}
    </div>
  );
}

/* ═════════════════════════════════════════════════════════════
   TAB: LLAVE
   ═════════════════════════════════════════════════════════════ */

function BracketsTab({ tournament, onRefresh }: { tournament: Tournament; onRefresh: () => void }) {
  const [generating, setGenerating] = useState(false);
  const [activeMatch, setActiveMatch] = useState<{ matchId: string; homeTeamName: string; awayTeamName: string; homeTeamId: string; awayTeamId: string } | null>(null);

  const brackets = tournament.brackets || [];

  // Group brackets by round
  const roundsMap: Record<string, Bracket[]> = {};
  brackets.forEach(b => {
    if (!roundsMap[b.round]) roundsMap[b.round] = [];
    roundsMap[b.round].push(b);
  });
  // Sort each round's brackets by position
  Object.values(roundsMap).forEach(arr => arr.sort((a, b) => a.position - b.position));

  // Order rounds logically
  const ROUND_ORDER = ['ROUND_OF_32', 'ROUND_OF_16', 'QUARTER_FINALS', 'SEMI_FINALS', 'FINAL'];
  const orderedRounds = Object.keys(roundsMap).sort((a, b) => {
    const ai = ROUND_ORDER.indexOf(a);
    const bi = ROUND_ORDER.indexOf(b);
    return (ai === -1 ? 100 : ai) - (bi === -1 ? 100 : bi);
  });

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      await api.post(`/tournaments/${tournament.id}/brackets/generate`);
      toast.success('Llave generada!');
      onRefresh();
    } catch (err: any) {
      toast.error(err.message || 'Error al generar llave');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="animate-fade-in-up">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-white">
          Llave eliminatoria
          <span className="text-text-muted font-normal ml-2">({brackets.length} partidos)</span>
        </h3>
        {brackets.length === 0 && (
          <button onClick={handleGenerate} disabled={generating} className="btn-primary">
            {generating ? (
              <span className="flex items-center gap-2"><Spinner /> Generando...</span>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Generar llave
              </>
            )}
          </button>
        )}
      </div>

      {brackets.length === 0 ? (
        <div className="card-elevated text-center py-12">
          <div className="w-16 h-16 rounded-full bg-surface-light flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-text-muted opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-text-secondary mb-2">Sin llave</h3>
          <p className="text-text-muted mb-4">Genera la llave eliminatoria una vez finalizadas las zonas</p>
          <button onClick={handleGenerate} disabled={generating} className="btn-primary">
            {generating ? 'Generando...' : 'Generar llave'}
          </button>
        </div>
      ) : (
        /* Bracket view: rounds as columns */
        <div className="overflow-x-auto pb-4">
          <div className="flex gap-6 min-w-fit">
            {orderedRounds.map((round, roundIdx) => {
              const bracketList = roundsMap[round];
              return (
                <div key={round} className="flex-shrink-0 w-72">
                  {/* Round header */}
                  <div className="mb-4">
                    <h4 className="text-sm font-bold text-text-muted uppercase tracking-wider flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-brand" />
                      {roundLabel(round)}
                    </h4>
                  </div>

                  {/* Bracket matches */}
                  <div className="space-y-3" style={{ paddingTop: `${roundIdx * 24}px` }}>
                    {bracketList.map(b => {
                      const homeName = b.homeTeam?.name || (b.isBye ? 'BYE' : 'TBD');
                      const awayName = b.awayTeam?.name || (b.isBye ? 'BYE' : 'TBD');
                      const hasResult = !!b.winnerId;
                      const canLoadResult = !hasResult && !b.isBye && b.homeTeamId && b.awayTeamId;
                      const matchId = b.matchId || b.id;

                      return (
                        <div
                          key={b.id}
                          className={`card-glow overflow-hidden ${b.isBye ? 'opacity-50' : ''}`}
                        >
                          {/* Home team */}
                          <div className={`flex items-center justify-between px-4 py-3 ${
                            b.winnerId === b.homeTeamId ? 'bg-brand/[0.08]' : ''
                          }`}>
                            <div className="flex items-center gap-2 min-w-0">
                              {b.winnerId === b.homeTeamId && (
                                <div className="w-1.5 h-6 rounded-full bg-brand flex-shrink-0" />
                              )}
                              <span className={`font-medium truncate ${
                                b.winnerId === b.homeTeamId ? 'text-brand font-bold' : 'text-white'
                              }`}>
                                {homeName}
                              </span>
                            </div>
                            {b.homeScore !== undefined && b.homeScore !== null && (
                              <span className="font-mono font-bold text-lg text-white ml-2">{b.homeScore}</span>
                            )}
                          </div>

                          <div className="h-px bg-border-dark" />

                          {/* Away team */}
                          <div className={`flex items-center justify-between px-4 py-3 ${
                            b.winnerId === b.awayTeamId ? 'bg-brand/[0.08]' : ''
                          }`}>
                            <div className="flex items-center gap-2 min-w-0">
                              {b.winnerId === b.awayTeamId && (
                                <div className="w-1.5 h-6 rounded-full bg-brand flex-shrink-0" />
                              )}
                              <span className={`font-medium truncate ${
                                b.winnerId === b.awayTeamId ? 'text-brand font-bold' : 'text-white'
                              }`}>
                                {awayName}
                              </span>
                            </div>
                            {b.awayScore !== undefined && b.awayScore !== null && (
                              <span className="font-mono font-bold text-lg text-white ml-2">{b.awayScore}</span>
                            )}
                          </div>

                          {/* Result action */}
                          {canLoadResult && (
                            <div className="border-t border-border-dark">
                              <button
                                onClick={() => setActiveMatch({
                                  matchId,
                                  homeTeamName: homeName,
                                  awayTeamName: awayName,
                                  homeTeamId: b.homeTeamId!,
                                  awayTeamId: b.awayTeamId!,
                                })}
                                className="w-full px-4 py-2 text-xs font-semibold text-brand hover:bg-brand/5 transition-colors text-center"
                              >
                                Cargar resultado
                              </button>
                            </div>
                          )}

                          {b.isLocked && (
                            <div className="px-4 py-1.5 bg-red-500/10 border-t border-red-500/20">
                              <span className="text-xs text-red-400 uppercase tracking-wider font-semibold flex items-center gap-1">
                                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                                Bloqueado
                              </span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {activeMatch && (
        <MatchResultModal
          tournamentId={tournament.id}
          match={activeMatch}
          onClose={() => setActiveMatch(null)}
          onSaved={onRefresh}
        />
      )}
    </div>
  );
}

/* ═════════════════════════════════════════════════════════════
   TAB: CONFIG
   ═════════════════════════════════════════════════════════════ */

function ConfigTab({ tournament, onRefresh }: { tournament: Tournament; onRefresh: () => void }) {
  const [status, setStatus] = useState(tournament.status);
  const [changingStatus, setChangingStatus] = useState(false);

  const handleStatusChange = async (newStatus: string) => {
    setChangingStatus(true);
    try {
      await api.patch(`/tournaments/${tournament.id}/status`, { status: newStatus });
      setStatus(newStatus);
      toast.success(`Estado cambiado a: ${statusLabel(newStatus)}`);
      onRefresh();
    } catch (err: any) {
      toast.error(err.message || 'Error al cambiar estado');
      setStatus(tournament.status);
    } finally {
      setChangingStatus(false);
    }
  };

  const formatDate = (d?: string) => fmt(d);

  return (
    <div className="animate-fade-in-up space-y-6">
      {/* Status change */}
      <div className="card-elevated">
        <h4 className="text-lg font-bold text-white mb-4">Estado del torneo</h4>
        <div className="flex flex-wrap gap-2">
          {STATUS_OPTIONS.map(opt => (
            <button
              key={opt.value}
              onClick={() => handleStatusChange(opt.value)}
              disabled={changingStatus}
              className={`px-4 py-2 rounded-pill text-sm font-semibold transition-all duration-200 border ${
                status === opt.value
                  ? 'bg-brand/15 border-brand/40 text-brand shadow-glow-green-sm'
                  : 'bg-surface-light border-border-dark text-text-secondary hover:border-border-default hover:text-white'
              }`}
            >
              {changingStatus && status !== opt.value ? '' : ''}{opt.label}
            </button>
          ))}
        </div>
        {changingStatus && (
          <div className="flex items-center gap-2 text-text-muted text-sm mt-3">
            <Spinner className="h-4 w-4" /> Cambiando estado...
          </div>
        )}
      </div>

      {/* Tournament info */}
      <div className="card-elevated">
        <h4 className="text-lg font-bold text-white mb-4">Informacion del torneo</h4>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 bg-surface-light rounded-xl border border-border-dark">
              <p className="text-xs text-text-muted uppercase tracking-wider mb-1">Nombre</p>
              <p className="text-white font-medium">{tournament.name}</p>
            </div>
            <div className="p-3 bg-surface-light rounded-xl border border-border-dark">
              <p className="text-xs text-text-muted uppercase tracking-wider mb-1">Deporte</p>
              <span className={tournament.sport === 'PADEL' ? 'badge-padel' : 'badge-tennis'}>
                {tournament.sport === 'PADEL' ? 'Padel' : 'Tenis'}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 bg-surface-light rounded-xl border border-border-dark">
              <p className="text-xs text-text-muted uppercase tracking-wider mb-1">Club</p>
              <p className="text-white font-medium">{tournament.club?.name || '-'}</p>
            </div>
            <div className="p-3 bg-surface-light rounded-xl border border-border-dark">
              <p className="text-xs text-text-muted uppercase tracking-wider mb-1">Max equipos</p>
              <p className="text-white font-medium">{tournament.maxTeams || 'Sin limite'}</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="p-3 bg-surface-light rounded-xl border border-border-dark">
              <p className="text-xs text-text-muted uppercase tracking-wider mb-1">Inicio</p>
              <p className="text-white font-medium text-sm">{formatDate(tournament.startDate)}</p>
            </div>
            <div className="p-3 bg-surface-light rounded-xl border border-border-dark">
              <p className="text-xs text-text-muted uppercase tracking-wider mb-1">Fin</p>
              <p className="text-white font-medium text-sm">{formatDate(tournament.endDate)}</p>
            </div>
            <div className="p-3 bg-surface-light rounded-xl border border-border-dark">
              <p className="text-xs text-text-muted uppercase tracking-wider mb-1">Cierre inscripcion</p>
              <p className="text-white font-medium text-sm">{formatDate(tournament.registrationEnd)}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 bg-surface-light rounded-xl border border-border-dark">
              <p className="text-xs text-text-muted uppercase tracking-wider mb-1">Puntos victoria</p>
              <p className="text-white font-bold text-lg">{tournament.pointsPerWin ?? 3}</p>
            </div>
            <div className="p-3 bg-surface-light rounded-xl border border-border-dark">
              <p className="text-xs text-text-muted uppercase tracking-wider mb-1">Puntos derrota</p>
              <p className="text-white font-bold text-lg">{tournament.pointsPerLoss ?? 0}</p>
            </div>
          </div>

          {tournament.description && (
            <div className="p-3 bg-surface-light rounded-xl border border-border-dark">
              <p className="text-xs text-text-muted uppercase tracking-wider mb-1">Descripcion</p>
              <p className="text-text-secondary text-sm">{tournament.description}</p>
            </div>
          )}

          {tournament.rules && (
            <div className="p-3 bg-surface-light rounded-xl border border-border-dark">
              <p className="text-xs text-text-muted uppercase tracking-wider mb-1">Reglas</p>
              <p className="text-text-secondary text-sm whitespace-pre-wrap">{tournament.rules}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ═════════════════════════════════════════════════════════════
   MAIN MANAGE PAGE
   ═════════════════════════════════════════════════════════════ */

type Tab = 'equipos' | 'zonas' | 'llave' | 'config';

function ManageTournamentContent() {
  const { id } = useParams<{ id: string }>();
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>('equipos');

  const fetchTournament = useCallback(async () => {
    try {
      const data = await api.get<Tournament>(`/tournaments/${id}`);
      setTournament(data);
    } catch (err: any) {
      toast.error(err.message || 'Error al cargar torneo');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (!authLoading && !user) { router.push('/login'); return; }
    if (user && id) fetchTournament();
  }, [user, authLoading, id, fetchTournament, router]);

  if (authLoading || !user || loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="flex items-center gap-3 text-text-muted">
          <Spinner />
          Cargando torneo...
        </div>
      </div>
    );
  }

  if (!tournament) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center">
        <div className="text-6xl mb-4 opacity-20">?</div>
        <h2 className="text-xl font-bold text-text-secondary mb-2">Torneo no encontrado</h2>
        <Link href="/tournaments" className="btn-secondary mt-4">Volver a torneos</Link>
      </div>
    );
  }

  const tabs: { key: Tab; label: string; count?: number }[] = [
    { key: 'equipos', label: 'Equipos', count: tournament.teams?.length || 0 },
    { key: 'zonas', label: 'Zonas', count: tournament.groups?.length || 0 },
    { key: 'llave', label: 'Llave', count: tournament.brackets?.length || 0 },
    { key: 'config', label: 'Config' },
  ];

  return (
    <div className="min-h-[calc(100vh-4rem)] relative">
      <div className="absolute inset-0 bg-gradient-mesh pointer-events-none" />

      <div className="relative z-10">
        {/* Hero header */}
        <div className="bg-surface border-b border-border-dark">
          <div className="max-w-7xl mx-auto px-4 py-8 sm:py-10">
            <div className="animate-fade-in-up">
              <Link
                href={tournament.club ? `/dashboard/club/${tournament.club.id}/tournaments` : '/tournaments'}
                className="inline-flex items-center gap-1 text-sm text-text-muted hover:text-brand transition-colors mb-4"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
                Torneos
              </Link>

              <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-2">
                <h1 className="text-2xl sm:text-3xl font-bold text-white">{tournament.name}</h1>
                <div className="flex gap-2">
                  <span className={tournament.sport === 'PADEL' ? 'badge-padel' : 'badge-tennis'}>
                    {tournament.sport === 'PADEL' ? 'Padel' : 'Tenis'}
                  </span>
                  <span className={statusBadgeClass(tournament.status)}>
                    {statusLabel(tournament.status)}
                  </span>
                </div>
              </div>

              {tournament.club?.name && (
                <p className="text-text-secondary flex items-center gap-2">
                  <svg className="w-4 h-4 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5" />
                  </svg>
                  {tournament.club.name}
                </p>
              )}

              {/* Stats */}
              <div className="flex flex-wrap gap-4 mt-4">
                <div className="stat-card px-5 py-3">
                  <p className="text-2xl font-bold text-white">{tournament.teams?.length || 0}</p>
                  <p className="text-xs text-text-muted uppercase tracking-wider">Equipos</p>
                </div>
                <div className="stat-card px-5 py-3">
                  <p className="text-2xl font-bold text-white">{tournament.groups?.length || 0}</p>
                  <p className="text-xs text-text-muted uppercase tracking-wider">Zonas</p>
                </div>
                <div className="stat-card px-5 py-3">
                  <p className="text-2xl font-bold text-white">{tournament.brackets?.length || 0}</p>
                  <p className="text-xs text-text-muted uppercase tracking-wider">Llave</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tab navigation */}
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-1 border-b border-border-dark -mb-px mt-4">
            {tabs.map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-5 py-3 text-sm font-semibold border-b-2 transition-colors ${
                  activeTab === tab.key
                    ? 'border-brand text-brand'
                    : 'border-transparent text-text-muted hover:text-white'
                }`}
              >
                {tab.label}
                {tab.count !== undefined && tab.count > 0 && (
                  <span className="ml-2 text-xs text-text-muted">({tab.count})</span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Tab content */}
        <div className="max-w-7xl mx-auto px-4 py-8">
          {activeTab === 'equipos' && (
            <TeamsTab tournament={tournament} onRefresh={fetchTournament} />
          )}
          {activeTab === 'zonas' && (
            <GroupsTab tournament={tournament} onRefresh={fetchTournament} />
          )}
          {activeTab === 'llave' && (
            <BracketsTab tournament={tournament} onRefresh={fetchTournament} />
          )}
          {activeTab === 'config' && (
            <ConfigTab tournament={tournament} onRefresh={fetchTournament} />
          )}
        </div>
      </div>
    </div>
  );
}

/* ═════════════════════════════════════════════════════════════
   PAGE WRAPPER WITH ROLE GUARD
   ═════════════════════════════════════════════════════════════ */

export default function ManageTournamentPage() {
  return (
    <RoleGuard role="CLUB_OWNER">
      <ManageTournamentContent />
    </RoleGuard>
  );
}
