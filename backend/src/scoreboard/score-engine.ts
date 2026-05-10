/* ─────────────────────────────────────────────────────────────
   Pure scoring engine — no DB, no side effects.
   Implements tennis/padel point scoring with:
     - STANDARD (deuce + advantage) or GOLDEN_POINT (sudden death)
     - Tiebreak at <tieBreakAt>-<tieBreakAt> games
     - Optional super tiebreak as the last "set"
     - Best-of-N sets configurable
   ───────────────────────────────────────────────────────────── */

export type Side = 'HOME' | 'AWAY';
export type ScoringMode = 'STANDARD' | 'GOLDEN_POINT';
export type Status = 'IN_PROGRESS' | 'PAUSED' | 'COMPLETED' | 'ABANDONED';

export type SbState = {
  // Settings
  scoringMode: ScoringMode;
  totalSets: number;
  gamesPerSet: number;
  tieBreakAt: number;
  superTieBreak: boolean;
  tieBreakPoints: number;
  superTieBreakPoints: number;

  // Live state
  status: Status;
  currentSet: number;        // 1-based
  homeSetGames: number[];    // games per set (length === currentSet)
  awaySetGames: number[];
  homePoints: number;        // 0..3 (0/15/30/40)
  awayPoints: number;
  homeAdvantage: boolean;
  awayAdvantage: boolean;
  inTieBreak: boolean;
  inSuperTieBreak: boolean;
  homeTbPoints: number;
  awayTbPoints: number;
  servingSide: Side;
  winner: Side | null;
};

export function initialState(opts: Partial<SbState>): SbState {
  return {
    scoringMode: opts.scoringMode ?? 'STANDARD',
    totalSets: opts.totalSets ?? 3,
    gamesPerSet: opts.gamesPerSet ?? 6,
    tieBreakAt: opts.tieBreakAt ?? 6,
    superTieBreak: opts.superTieBreak ?? false,
    tieBreakPoints: opts.tieBreakPoints ?? 7,
    superTieBreakPoints: opts.superTieBreakPoints ?? 10,

    status: 'IN_PROGRESS',
    currentSet: 1,
    homeSetGames: [0],
    awaySetGames: [0],
    homePoints: 0,
    awayPoints: 0,
    homeAdvantage: false,
    awayAdvantage: false,
    inTieBreak: false,
    inSuperTieBreak: !!opts.superTieBreak && (opts.totalSets ?? 3) === 1,
    homeTbPoints: 0,
    awayTbPoints: 0,
    servingSide: 'HOME',
    winner: null,
  };
}

function clone(s: SbState): SbState {
  return {
    ...s,
    homeSetGames: [...s.homeSetGames],
    awaySetGames: [...s.awaySetGames],
  };
}

/** Sets won, counting all entries in homeSetGames/awaySetGames. Call only when
 *  the just-played set is finalised (or when computing total at COMPLETE). */
function countSetsWonBy(s: SbState): { HOME: number; AWAY: number } {
  let HOME = 0, AWAY = 0;
  for (let i = 0; i < s.currentSet; i++) {
    const h = s.homeSetGames[i] ?? 0;
    const a = s.awaySetGames[i] ?? 0;
    if (h > a) HOME++;
    else if (a > h) AWAY++;
  }
  return { HOME, AWAY };
}

function setsToWin(s: SbState): number {
  return Math.ceil(s.totalSets / 2);
}

function maybeAdvanceSet(s: SbState): SbState {
  // Called after a set ends. Decide: match over, or open next set.
  const wins = countSetsWonBy(s);
  const need = setsToWin(s);
  if (wins.HOME >= need) {
    s.status = 'COMPLETED';
    s.winner = 'HOME';
    return s;
  }
  if (wins.AWAY >= need) {
    s.status = 'COMPLETED';
    s.winner = 'AWAY';
    return s;
  }
  s.currentSet++;
  s.homeSetGames.push(0);
  s.awaySetGames.push(0);
  // Last set may be a super tiebreak.
  if (s.superTieBreak && s.currentSet === s.totalSets) {
    s.inSuperTieBreak = true;
    s.homeTbPoints = 0;
    s.awayTbPoints = 0;
  }
  return s;
}

function tieBreakWinner(home: number, away: number, target: number): Side | null {
  if (home >= target && home - away >= 2) return 'HOME';
  if (away >= target && away - home >= 2) return 'AWAY';
  return null;
}

export type AwardResult = {
  state: SbState;
  gameWon: boolean;
  setWon: boolean;
  matchWon: boolean;
};

export function awardPoint(prev: SbState, side: Side): AwardResult {
  if (prev.status === 'COMPLETED') {
    return { state: prev, gameWon: false, setWon: false, matchWon: false };
  }

  const s = clone(prev);
  let gameWon = false, setWon = false, matchWon = false;

  if (s.inTieBreak || s.inSuperTieBreak) {
    if (side === 'HOME') s.homeTbPoints++;
    else s.awayTbPoints++;

    const target = s.inSuperTieBreak ? s.superTieBreakPoints : s.tieBreakPoints;
    const tbW = tieBreakWinner(s.homeTbPoints, s.awayTbPoints, target);
    if (tbW) {
      gameWon = true;
      setWon = true;
      const idx = s.currentSet - 1;
      if (s.inTieBreak) {
        // Standard 7-6 tb: winner takes the 7th game.
        if (tbW === 'HOME') s.homeSetGames[idx]++;
        else s.awaySetGames[idx]++;
      } else {
        // Super tiebreak: counts as a set, recorded as 1-0 / 0-1.
        s.homeSetGames[idx] = tbW === 'HOME' ? 1 : 0;
        s.awaySetGames[idx] = tbW === 'AWAY' ? 1 : 0;
      }
      s.inTieBreak = false;
      s.inSuperTieBreak = false;
      s.homeTbPoints = 0;
      s.awayTbPoints = 0;
      const after = maybeAdvanceSet(s);
      matchWon = after.status === 'COMPLETED';
      // Tiebreak first server is alternating 1-1-2-2-…; we keep simple toggle on game change.
      after.servingSide = after.servingSide === 'HOME' ? 'AWAY' : 'HOME';
      return { state: after, gameWon, setWon, matchWon };
    }
    // Toggle serve every odd combined point in tb (1, 3, 5, 7…)
    const total = s.homeTbPoints + s.awayTbPoints;
    if (total > 0 && total % 2 === 1) {
      s.servingSide = s.servingSide === 'HOME' ? 'AWAY' : 'HOME';
    }
    return { state: s, gameWon, setWon, matchWon };
  }

  // ── Normal game-point scoring ───────────────────────────────
  if (side === 'HOME') {
    if (s.awayAdvantage) {
      // Back to deuce
      s.awayAdvantage = false;
    } else if (s.homeAdvantage) {
      gameWon = true;
    } else if (s.homePoints === 3 && s.awayPoints === 3) {
      if (s.scoringMode === 'GOLDEN_POINT') gameWon = true;
      else s.homeAdvantage = true;
    } else if (s.homePoints === 3) {
      gameWon = true;
    } else {
      s.homePoints++;
    }
  } else {
    if (s.homeAdvantage) {
      s.homeAdvantage = false;
    } else if (s.awayAdvantage) {
      gameWon = true;
    } else if (s.homePoints === 3 && s.awayPoints === 3) {
      if (s.scoringMode === 'GOLDEN_POINT') gameWon = true;
      else s.awayAdvantage = true;
    } else if (s.awayPoints === 3) {
      gameWon = true;
    } else {
      s.awayPoints++;
    }
  }

  if (gameWon) {
    s.homePoints = 0;
    s.awayPoints = 0;
    s.homeAdvantage = false;
    s.awayAdvantage = false;
    const idx = s.currentSet - 1;
    if (side === 'HOME') s.homeSetGames[idx]++;
    else s.awaySetGames[idx]++;
    s.servingSide = s.servingSide === 'HOME' ? 'AWAY' : 'HOME';

    const h = s.homeSetGames[idx];
    const a = s.awaySetGames[idx];

    // Tiebreak entry: both at tieBreakAt-tieBreakAt (typically 6-6)
    if (h === s.tieBreakAt && a === s.tieBreakAt) {
      s.inTieBreak = true;
      s.homeTbPoints = 0;
      s.awayTbPoints = 0;
      return { state: s, gameWon, setWon, matchWon };
    }

    // Set won by 2-game margin starting at gamesPerSet
    const wonBy2 = (h >= s.gamesPerSet && h - a >= 2) || (a >= s.gamesPerSet && a - h >= 2);
    if (wonBy2) {
      setWon = true;
      const after = maybeAdvanceSet(s);
      matchWon = after.status === 'COMPLETED';
      return { state: after, gameWon, setWon, matchWon };
    }
  }

  return { state: s, gameWon, setWon, matchWon };
}

/** Compact label for live point display (helps UI render 0/15/30/40). */
export function gamePointLabel(p: number): string {
  return ['0', '15', '30', '40'][p] || String(p);
}
