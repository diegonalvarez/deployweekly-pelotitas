import { PrismaClient, Sport, CourtSurface, CourtType, UserRole } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  const userCount = await prisma.user.count();
  if (userCount > 0) {
    console.log('Database already seeded, skipping.');
    return;
  }

  const hash = await bcrypt.hash('password123', 12);

  // ─── ADMIN ────────────────────────────────────────────
  const admin = await prisma.user.create({
    data: {
      email: 'admin@pelotitas.com',
      passwordHash: hash,
      firstName: 'Admin',
      lastName: 'Pelotitas',
      roles: [UserRole.ADMIN],
      identityStatus: 'VERIFIED',
      phoneVerified: true,
      termsAcceptedAt: new Date(),
    },
  });

  // ─── CLUB OWNER ───────────────────────────────────────
  const owner = await prisma.user.create({
    data: {
      email: 'club@pelotitas.com',
      passwordHash: hash,
      firstName: 'Carlos',
      lastName: 'Gomez',
      phone: '+5491155551234',
      roles: [UserRole.CLUB_OWNER, UserRole.PLAYER],
      identityStatus: 'VERIFIED',
      phoneVerified: true,
      termsAcceptedAt: new Date(),
      playerProfile: {
        create: { city: 'Buenos Aires', state: 'CABA', sports: [Sport.PADEL, Sport.TENNIS] },
      },
    },
  });

  // ─── CLUB (APPROVED) ─────────────────────────────────
  const club = await prisma.clubProfile.create({
    data: {
      ownerId: owner.id,
      name: 'Club Deportivo Norte',
      description: 'El mejor complejo de padel y tenis de zona norte. 8 canchas, profesores y torneos todo el ano.',
      phone: '+5491155559999',
      email: 'info@clubnorte.com',
      sports: [Sport.PADEL, Sport.TENNIS],
      approvalStatus: 'APPROVED',
      approvedAt: new Date(),
      reservationMode: 'OPEN',
      paymentMethods: ['cash', 'transfer'],
      locations: {
        create: {
          name: 'Sede principal',
          address: 'Av. Libertador 5000',
          city: 'Buenos Aires',
          state: 'CABA',
          latitude: -34.5579,
          longitude: -58.4173,
          isMain: true,
        },
      },
    },
  });

  // ─── PENDING CLUB (for admin approval demo) ──────────
  const pendingOwner = await prisma.user.create({
    data: {
      email: 'pending@pelotitas.com',
      passwordHash: hash,
      firstName: 'Roberto',
      lastName: 'Martinez',
      phone: '+5491155558888',
      roles: [UserRole.CLUB_OWNER],
      identityStatus: 'PENDING',
      phoneVerified: true,
      termsAcceptedAt: new Date(),
    },
  });

  await prisma.clubProfile.create({
    data: {
      ownerId: pendingOwner.id,
      name: 'Padel Zone Sur',
      description: 'Nuevo complejo en zona sur con 4 canchas de padel.',
      phone: '+5491155557777',
      sports: [Sport.PADEL],
      approvalStatus: 'PENDING',
      locations: {
        create: {
          name: 'Sede unica',
          address: 'Calle 44 1200',
          city: 'La Plata',
          state: 'Buenos Aires',
          latitude: -34.9205,
          longitude: -57.9536,
          isMain: true,
        },
      },
    },
  });

  // ─── COURTS ───────────────────────────────────────────
  const location = await prisma.clubLocation.findFirst({ where: { clubId: club.id } });

  const courts = await Promise.all([
    prisma.court.create({
      data: { clubId: club.id, locationId: location!.id, name: 'Cancha Padel 1', sport: Sport.PADEL, surface: CourtSurface.SYNTHETIC, courtType: CourtType.OUTDOOR, hasLighting: true, blockDuration: 90 },
    }),
    prisma.court.create({
      data: { clubId: club.id, locationId: location!.id, name: 'Cancha Padel 2', sport: Sport.PADEL, surface: CourtSurface.SYNTHETIC, courtType: CourtType.INDOOR, hasLighting: true, blockDuration: 90 },
    }),
    prisma.court.create({
      data: { clubId: club.id, locationId: location!.id, name: 'Cancha Padel 3', sport: Sport.PADEL, surface: CourtSurface.SYNTHETIC, courtType: CourtType.OUTDOOR, hasLighting: true, blockDuration: 90 },
    }),
    prisma.court.create({
      data: { clubId: club.id, locationId: location!.id, name: 'Cancha Tenis 1', sport: Sport.TENNIS, surface: CourtSurface.CLAY, courtType: CourtType.OUTDOOR, hasLighting: true, blockDuration: 60 },
    }),
    prisma.court.create({
      data: { clubId: club.id, locationId: location!.id, name: 'Cancha Tenis 2', sport: Sport.TENNIS, surface: CourtSurface.HARD, courtType: CourtType.OUTDOOR, hasLighting: false, blockDuration: 60 },
    }),
  ]);

  for (const court of courts) {
    for (let day = 0; day <= 6; day++) {
      await prisma.courtAvailability.create({
        data: { courtId: court.id, dayOfWeek: day, openTime: '08:00', closeTime: '22:00' },
      });
    }
  }

  // ─── COACH ────────────────────────────────────────────
  const coachUser = await prisma.user.create({
    data: {
      email: 'profe@pelotitas.com',
      passwordHash: hash,
      firstName: 'Martin',
      lastName: 'Rodriguez',
      phone: '+5491155556789',
      roles: [UserRole.COACH],
      identityStatus: 'VERIFIED',
      phoneVerified: true,
      termsAcceptedAt: new Date(),
      coachProfile: {
        create: {
          bio: 'Profesor de padel y tenis con 8 anos de experiencia. Ex ranking top 100 nacional juvenil.',
          sports: [Sport.PADEL, Sport.TENNIS],
          experience: '8 anos',
          certifications: 'AAT nivel 2',
          pricePerHour: 5000,
          groupPrice: 3000,
          requireConnection: true,
          autoAcceptAll: false,
        },
      },
    },
  });

  const coachProfile = await prisma.coachProfile.findUnique({ where: { userId: coachUser.id } });
  await prisma.coachClubLink.create({
    data: { coachId: coachProfile!.id, clubId: club.id, status: 'ACTIVE' },
  });

  for (let day = 1; day <= 5; day++) {
    await prisma.coachAvailability.create({
      data: { coachId: coachProfile!.id, clubId: club.id, dayOfWeek: day, startTime: '09:00', endTime: '18:00' },
    });
  }

  // ─── TOURNAMENT ORGANIZER ─────────────────────────────
  const organizer = await prisma.user.create({
    data: {
      email: 'organizador@pelotitas.com',
      passwordHash: hash,
      firstName: 'Pablo',
      lastName: 'Sanchez',
      phone: '+5491155554444',
      roles: [UserRole.TOURNAMENT_ORGANIZER, UserRole.PLAYER],
      identityStatus: 'VERIFIED',
      phoneVerified: true,
      termsAcceptedAt: new Date(),
      playerProfile: { create: { city: 'Buenos Aires', state: 'CABA', sports: [Sport.PADEL], padelLevel: 5 } },
      organizerProfile: {
        create: { bio: 'Organizador de torneos de padel amateur', referralCode: 'PEL-PABLO1' },
      },
    },
  });

  // Organizer connected to club
  await prisma.connection.create({
    data: {
      fromUserId: organizer.id,
      toUserId: owner.id,
      type: 'ORGANIZER_CLUB',
      clubId: club.id,
      status: 'ACCEPTED',
      respondedAt: new Date(),
    },
  });

  // ─── PLAYERS ──────────────────────────────────────────
  const playerNames = [
    { firstName: 'Juan', lastName: 'Perez', city: 'Buenos Aires', padelLevel: 6, tennisLevel: 4, padelCategory: '5ta' },
    { firstName: 'Maria', lastName: 'Lopez', city: 'Buenos Aires', padelLevel: 7, tennisLevel: null, padelCategory: '4ta' },
    { firstName: 'Pedro', lastName: 'Martinez', city: 'Cordoba', padelLevel: 5, tennisLevel: 6, padelCategory: '6ta' },
    { firstName: 'Ana', lastName: 'Garcia', city: 'Buenos Aires', padelLevel: 4, tennisLevel: 5, padelCategory: '7ma' },
    { firstName: 'Lucas', lastName: 'Fernandez', city: 'Rosario', padelLevel: 8, tennisLevel: null, padelCategory: '3ra' },
    { firstName: 'Sofia', lastName: 'Diaz', city: 'Buenos Aires', padelLevel: 3, tennisLevel: 7, padelCategory: '8va' },
    { firstName: 'Diego', lastName: 'Silva', city: 'Buenos Aires', padelLevel: 6, tennisLevel: 3, padelCategory: '5ta' },
    { firstName: 'Camila', lastName: 'Ruiz', city: 'Mendoza', padelLevel: 5, tennisLevel: 5, padelCategory: '6ta' },
    { firstName: 'Mateo', lastName: 'Torres', city: 'Buenos Aires', padelLevel: 7, tennisLevel: 6, padelCategory: '4ta' },
    { firstName: 'Valentina', lastName: 'Moreno', city: 'Buenos Aires', padelLevel: 4, tennisLevel: null, padelCategory: '7ma' },
    { firstName: 'Nicolas', lastName: 'Alvarez', city: 'Buenos Aires', padelLevel: 6, tennisLevel: 5, padelCategory: '5ta' },
    { firstName: 'Florencia', lastName: 'Sanchez', city: 'La Plata', padelLevel: 5, tennisLevel: 4, padelCategory: '6ta' },
  ];

  const players: any[] = [];
  for (const p of playerNames) {
    const user = await prisma.user.create({
      data: {
        email: `${p.firstName.toLowerCase()}.${p.lastName.toLowerCase()}@test.com`,
        passwordHash: hash,
        firstName: p.firstName,
        lastName: p.lastName,
        roles: [UserRole.PLAYER],
        identityStatus: 'VERIFIED',
        phoneVerified: true,
        termsAcceptedAt: new Date(),
        playerProfile: {
          create: {
            city: p.city,
            state: p.city === 'Buenos Aires' ? 'CABA' : p.city,
            sports: [...(p.padelLevel ? [Sport.PADEL] : []), ...(p.tennisLevel ? [Sport.TENNIS] : [])],
            padelLevel: p.padelLevel,
            tennisLevel: p.tennisLevel,
            padelCategory: p.padelCategory,
            hand: 'RIGHT',
          },
        },
      },
    });
    players.push(user);
  }

  // ─── CONNECTIONS (some players connected to club) ─────
  for (let i = 0; i < 6; i++) {
    await prisma.connection.create({
      data: {
        fromUserId: players[i].id,
        toUserId: owner.id,
        type: 'PLAYER_CLUB',
        clubId: club.id,
        status: 'ACCEPTED',
        respondedAt: new Date(),
      },
    });
  }

  // Some players connected to coach
  for (let i = 0; i < 4; i++) {
    await prisma.connection.create({
      data: {
        fromUserId: players[i].id,
        toUserId: coachUser.id,
        type: 'PLAYER_COACH',
        coachId: coachProfile!.id,
        status: 'ACCEPTED',
        respondedAt: new Date(),
      },
    });
  }

  // ─── SAMPLE RESERVATIONS ──────────────────────────────
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = 0; i < 5; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() + i);
    await prisma.reservation.create({
      data: {
        courtId: courts[i % courts.length].id,
        userId: players[i % players.length].id,
        date,
        startTime: `${14 + i}:00`,
        endTime: `${15 + i}:00`,
        sport: courts[i % courts.length].sport,
        status: 'CONFIRMED',
      },
    });
  }

  // ─── SAMPLE TOURNAMENT (by organizer) ─────────────────
  const tournament = await prisma.tournament.create({
    data: {
      clubId: club.id,
      createdById: organizer.id,
      name: 'Torneo Apertura Padel 2026',
      description: 'Torneo de padel por parejas. Fase de grupos + eliminatoria.',
      sport: Sport.PADEL,
      status: 'GROUP_STAGE',
      maxTeams: 12,
      startDate: today,
      pointsPerWin: 3,
      pointsPerLoss: 0,
      pointsPerWalkover: 1,
      tiebreakers: ['POINTS', 'SET_DIFF', 'GAME_DIFF', 'HEAD_TO_HEAD'],
    },
  });

  // Update organizer profile
  await prisma.organizerProfile.update({
    where: { userId: organizer.id },
    data: { freeTournamentsUsed: 1 },
  });

  // Create 10 teams -> 3 uneven groups (4/3/3)
  const teamData = [
    { name: 'Perez / Lopez', p: [players[0].id, players[1].id] },
    { name: 'Martinez / Garcia', p: [players[2].id, players[3].id] },
    { name: 'Fernandez / Diaz', p: [players[4].id, players[5].id] },
    { name: 'Silva / Ruiz', p: [players[6].id, players[7].id] },
    { name: 'Torres / Moreno', p: [players[8].id, players[9].id] },
    { name: 'Alvarez / Sanchez', p: [players[10].id, players[11].id] },
    { name: 'Perez / Garcia', p: [players[0].id, players[3].id] },
    { name: 'Lopez / Fernandez', p: [players[1].id, players[4].id] },
    { name: 'Diaz / Torres', p: [players[5].id, players[8].id] },
    { name: 'Moreno / Silva', p: [players[9].id, players[6].id] },
  ];

  const teams: any[] = [];
  for (const t of teamData) {
    const team = await prisma.tournamentTeam.create({
      data: {
        tournamentId: tournament.id,
        name: t.name,
        players: { create: t.p.map(id => ({ userId: id })) },
      },
    });
    teams.push(team);
  }

  // Uneven groups: A=4, B=3, C=3
  for (const groupDef of [
    { name: 'Zona A', teamIdxs: [0, 1, 2, 3] },
    { name: 'Zona B', teamIdxs: [4, 5, 6] },
    { name: 'Zona C', teamIdxs: [7, 8, 9] },
  ]) {
    const group = await prisma.tournamentGroup.create({
      data: {
        tournamentId: tournament.id,
        name: groupDef.name,
        qualifyCount: 2,
        members: {
          create: groupDef.teamIdxs.map(idx => ({ teamId: teams[idx].id })),
        },
      },
    });

    const members = await prisma.tournamentGroupMember.findMany({ where: { groupId: group.id } });
    for (let i = 0; i < members.length; i++) {
      for (let j = i + 1; j < members.length; j++) {
        await prisma.tournamentMatch.create({
          data: {
            tournamentId: tournament.id,
            groupId: group.id,
            homeTeamId: members[i].teamId,
            awayTeamId: members[j].teamId,
            status: 'SCHEDULED',
          },
        });
      }
    }
  }

  // ─── ACHIEVEMENTS ─────────────────────────────────────
  await prisma.achievement.createMany({
    data: [
      { key: 'first_reservation', name: 'Primera reserva', description: 'Hiciste tu primera reserva', iconEmoji: '\uD83C\uDFAF', xpReward: 10, category: 'milestone' },
      { key: 'first_match', name: 'Primer partido', description: 'Jugaste tu primer partido', iconEmoji: '\u26A1', xpReward: 15, category: 'milestone' },
      { key: '10_matches', name: '10 partidos', description: 'Jugaste 10 partidos', iconEmoji: '\uD83D\uDD25', xpReward: 50, category: 'milestone' },
      { key: 'first_tournament', name: 'Primer torneo', description: 'Participaste en tu primer torneo', iconEmoji: '\uD83C\uDFC6', xpReward: 25, category: 'tournament' },
      { key: 'tournament_champion', name: 'Campeon!', description: 'Ganaste un torneo', iconEmoji: '\uD83D\uDC51', xpReward: 100, category: 'tournament' },
      { key: '5_wins_streak', name: 'Racha de 5', description: 'Ganaste 5 partidos seguidos', iconEmoji: '\uD83D\uDCAA', xpReward: 75, category: 'milestone' },
      { key: 'connected_10', name: 'Red de 10', description: 'Conectaste con 10 usuarios', iconEmoji: '\uD83E\uDD1D', xpReward: 30, category: 'social' },
      { key: 'first_class', name: 'Primera clase', description: 'Tomaste tu primera clase', iconEmoji: '\uD83C\uDF93', xpReward: 15, category: 'training' },
      { key: 'night_owl', name: 'Nocturno', description: 'Reservaste despues de las 21:00', iconEmoji: '\uD83E\uDD89', xpReward: 10, category: 'general' },
      { key: 'early_bird', name: 'Madrugador', description: 'Reservaste antes de las 9:00', iconEmoji: '\uD83C\uDF05', xpReward: 10, category: 'general' },
    ],
    skipDuplicates: true,
  });
  console.log('  Achievements seeded');

  // ─── FEATURE FLAGS ────────────────────────────────────
  await prisma.featureFlag.createMany({
    data: [
      { key: 'ENABLE_PAYMENTS', value: 'false', description: 'Enable payment processing' },
      { key: 'ENABLE_WHATSAPP', value: 'false', description: 'Enable WhatsApp notifications' },
      { key: 'ENABLE_EMAIL', value: 'false', description: 'Enable email notifications' },
      { key: 'ENABLE_GOOGLE_AUTH', value: 'false', description: 'Enable Google OAuth' },
      { key: 'ENABLE_IDENTITY_VERIFICATION', value: 'false', description: 'Require DNI verification' },
      { key: 'FREE_TOURNAMENTS_PER_ORGANIZER', value: '5', description: 'Free tournaments per organizer' },
    ],
  });

  console.log('Seed completed!');
  console.log('');
  console.log('Test accounts (password: password123):');
  console.log('  Admin:      admin@pelotitas.com');
  console.log('  Club Owner: club@pelotitas.com');
  console.log('  Coach:      profe@pelotitas.com');
  console.log('  Organizer:  organizador@pelotitas.com');
  console.log('  Player:     juan.perez@test.com');
  console.log('');
  console.log('  Pending club: "Padel Zone Sur" (for admin approval demo)');
  console.log(`  Tournament: "${tournament.name}" with ${teams.length} teams in 3 uneven groups (4/3/3)`);
  console.log('  Connections: 6 players connected to club, 4 players connected to coach');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
