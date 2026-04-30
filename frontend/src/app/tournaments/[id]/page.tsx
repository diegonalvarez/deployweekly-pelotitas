'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { useParams } from 'next/navigation';
import Link from 'next/link';

export default function TournamentDetailPage() {
  const { id } = useParams();
  const [tournament, setTournament] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'groups' | 'brackets' | 'teams'>('teams');

  useEffect(() => {
    api.get(`/tournaments/${id}`)
      .then(data => {
        setTournament(data);
        // Auto-select the most interesting tab
        if (data.brackets?.length > 0) setActiveTab('brackets');
        else if (data.groups?.length > 0) setActiveTab('groups');
        else setActiveTab('teams');
      })
      .finally(() => setLoading(false));
  }, [id]);

  const statusBadgeClass = (s: string) => {
    switch (s) {
      case 'REGISTRATION': return 'badge-yellow';
      case 'GROUP_STAGE':
      case 'IN_PROGRESS':
      case 'BRACKET_STAGE': return 'badge-green';
      case 'FINISHED': return 'badge-neutral';
      default: return 'badge-yellow';
    }
  };

  const statusLabel = (s: string) => {
    switch (s) {
      case 'REGISTRATION': return 'Inscripcion';
      case 'GROUP_STAGE': return 'Fase de grupos';
      case 'BRACKET_STAGE': return 'Llave';
      case 'IN_PROGRESS': return 'En curso';
      case 'FINISHED': return 'Finalizado';
      default: return s;
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="flex items-center gap-3 text-text-muted">
          <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          Cargando torneo...
        </div>
      </div>
    );
  }

  if (!tournament) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center">
        <div className="text-6xl mb-4 opacity-20">🏆</div>
        <h2 className="text-xl font-bold text-text-secondary mb-2">Torneo no encontrado</h2>
        <Link href="/tournaments" className="btn-secondary mt-4">Volver a torneos</Link>
      </div>
    );
  }

  const roundLabel = (round: string) => round.replace(/_/g, ' ').replace(/ROUND OF (\d+)/, 'Ronda de $1').replace('QUARTER_FINALS', 'Cuartos').replace('SEMI_FINALS', 'Semifinal').replace('FINAL', 'Final');

  return (
    <div className="min-h-[calc(100vh-4rem)] relative">
      <div className="absolute inset-0 bg-gradient-mesh pointer-events-none" />

      <div className="relative z-10">
        {/* Hero */}
        <div className="bg-surface border-b border-border-dark">
          <div className="max-w-7xl mx-auto px-4 py-10 sm:py-14">
            <div className="animate-fade-in-up">
              <Link href="/tournaments" className="inline-flex items-center gap-1 text-sm text-text-muted hover:text-brand transition-colors mb-6">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
                Torneos
              </Link>

              <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-4">
                <h1 className="text-3xl sm:text-4xl font-bold text-white">{tournament.name}</h1>
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
                <p className="text-text-secondary text-lg flex items-center gap-2">
                  <svg className="w-5 h-5 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5" />
                  </svg>
                  {tournament.club.name}
                </p>
              )}

              {tournament.description && (
                <p className="text-text-secondary mt-4 max-w-2xl">{tournament.description}</p>
              )}

              {/* Stats row */}
              <div className="flex flex-wrap gap-6 mt-6">
                <div className="stat-card px-5 py-3">
                  <p className="text-2xl font-bold text-white">{tournament.teams?.length || 0}</p>
                  <p className="text-xs text-text-muted uppercase tracking-wider">Equipos</p>
                </div>
                <div className="stat-card px-5 py-3">
                  <p className="text-2xl font-bold text-white">{tournament.groups?.length || 0}</p>
                  <p className="text-xs text-text-muted uppercase tracking-wider">Zonas</p>
                </div>
                {tournament.brackets?.length > 0 && (
                  <div className="stat-card px-5 py-3">
                    <p className="text-2xl font-bold text-white">{tournament.brackets.length}</p>
                    <p className="text-xs text-text-muted uppercase tracking-wider">Partidos llave</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Tab navigation */}
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-1 border-b border-border-dark -mb-px mt-6">
            {[
              { key: 'teams' as const, label: 'Equipos', count: tournament.teams?.length },
              { key: 'groups' as const, label: 'Zonas', count: tournament.groups?.length },
              { key: 'brackets' as const, label: 'Llave', count: tournament.brackets?.length },
            ].filter(tab => (tab.count || 0) > 0 || tab.key === 'teams').map(tab => (
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
                {tab.count > 0 && (
                  <span className="ml-2 text-xs text-text-muted">({tab.count})</span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Tab content */}
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Teams tab */}
          {activeTab === 'teams' && (
            <div className="animate-fade-in-up">
              {(!tournament.teams || tournament.teams.length === 0) ? (
                <div className="text-center py-12">
                  <p className="text-text-muted">No hay equipos inscriptos todavia</p>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {tournament.teams.map((team: any, i: number) => (
                    <div
                      key={team.id}
                      className="card-glow animate-fade-in-up"
                      style={{ animationDelay: `${i * 50}ms` }}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-brand/10 flex items-center justify-center text-brand font-bold text-sm">
                          {team.name?.[0] || '#'}
                        </div>
                        <div>
                          <h3 className="font-bold text-white">{team.name}</h3>
                          <p className="text-xs text-text-muted">
                            {team.players?.map((p: any) => `${p.user.firstName} ${p.user.lastName}`).join(' / ')}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Groups tab */}
          {activeTab === 'groups' && tournament.groups?.length > 0 && (
            <div className="space-y-8 animate-fade-in-up">
              {tournament.groups.map((group: any) => (
                <div key={group.id} className="card-elevated overflow-hidden">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-white">{group.name}</h3>
                    <div className="flex gap-2">
                      <span className="badge-neutral">
                        {group.members?.length || 0} equipos
                      </span>
                      <span className="badge-green">
                        Clasifican: {group.qualifyCount}
                      </span>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
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
                        {group.members?.map((m: any, i: number) => (
                          <tr
                            key={m.id}
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
                                  <span className="text-2xs text-warning">manual</span>
                                )}
                              </div>
                            </td>
                            <td className="py-3 px-2 text-center text-text-secondary">{m.matchesPlayed}</td>
                            <td className="py-3 px-2 text-center text-brand font-medium">{m.matchesWon}</td>
                            <td className="py-3 px-2 text-center text-negative font-medium">{m.matchesLost}</td>
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
                </div>
              ))}
            </div>
          )}

          {/* Brackets tab */}
          {activeTab === 'brackets' && tournament.brackets?.length > 0 && (
            <div className="animate-fade-in-up">
              {Object.entries(
                tournament.brackets.reduce((acc: any, b: any) => {
                  if (!acc[b.round]) acc[b.round] = [];
                  acc[b.round].push(b);
                  return acc;
                }, {}),
              ).map(([round, brackets]: [string, any], roundIdx) => (
                <div key={round} className="mb-8">
                  <h4 className="text-sm font-bold text-text-muted uppercase tracking-wider mb-4 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-brand" />
                    {roundLabel(round)}
                  </h4>
                  <div className="grid md:grid-cols-2 gap-3">
                    {brackets.map((b: any) => (
                      <div
                        key={b.id}
                        className={`card-glow overflow-hidden ${b.isBye ? 'opacity-50' : ''}`}
                      >
                        {/* Home team */}
                        <div className={`flex items-center justify-between px-4 py-3 ${
                          b.winnerId === b.homeTeamId ? 'bg-brand/[0.08]' : ''
                        }`}>
                          <div className="flex items-center gap-3">
                            {b.winnerId === b.homeTeamId && (
                              <div className="w-1.5 h-6 rounded-full bg-brand" />
                            )}
                            <span className={`font-medium ${
                              b.winnerId === b.homeTeamId ? 'text-brand font-bold' : 'text-white'
                            }`}>
                              {b.homeTeam?.name || (b.isBye ? 'BYE' : 'TBD')}
                            </span>
                          </div>
                          {b.homeScore !== undefined && b.homeScore !== null && (
                            <span className="font-mono font-bold text-lg text-white">{b.homeScore}</span>
                          )}
                        </div>

                        <div className="h-px bg-border-dark" />

                        {/* Away team */}
                        <div className={`flex items-center justify-between px-4 py-3 ${
                          b.winnerId === b.awayTeamId ? 'bg-brand/[0.08]' : ''
                        }`}>
                          <div className="flex items-center gap-3">
                            {b.winnerId === b.awayTeamId && (
                              <div className="w-1.5 h-6 rounded-full bg-brand" />
                            )}
                            <span className={`font-medium ${
                              b.winnerId === b.awayTeamId ? 'text-brand font-bold' : 'text-white'
                            }`}>
                              {b.awayTeam?.name || (b.isBye ? 'BYE' : 'TBD')}
                            </span>
                          </div>
                          {b.awayScore !== undefined && b.awayScore !== null && (
                            <span className="font-mono font-bold text-lg text-white">{b.awayScore}</span>
                          )}
                        </div>

                        {b.isLocked && (
                          <div className="px-4 py-1.5 bg-negative/10 border-t border-negative/20">
                            <span className="text-2xs text-negative uppercase tracking-wider font-semibold flex items-center gap-1">
                              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                              </svg>
                              Bloqueado
                            </span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
