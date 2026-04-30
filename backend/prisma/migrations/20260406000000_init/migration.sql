-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('PLAYER', 'COACH', 'CLUB_OWNER', 'TOURNAMENT_ORGANIZER', 'ADMIN');

-- CreateEnum
CREATE TYPE "Sport" AS ENUM ('PADEL', 'TENNIS');

-- CreateEnum
CREATE TYPE "HandPreference" AS ENUM ('LEFT', 'RIGHT', 'AMBIDEXTROUS');

-- CreateEnum
CREATE TYPE "CourtSurface" AS ENUM ('CLAY', 'HARD', 'GRASS', 'SYNTHETIC', 'CONCRETE', 'CARPET');

-- CreateEnum
CREATE TYPE "CourtType" AS ENUM ('INDOOR', 'OUTDOOR');

-- CreateEnum
CREATE TYPE "ReservationStatus" AS ENUM ('PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED', 'NO_SHOW');

-- CreateEnum
CREATE TYPE "CourtStatus" AS ENUM ('AVAILABLE', 'RESERVED', 'BLOCKED', 'MAINTENANCE');

-- CreateEnum
CREATE TYPE "ReservationAccessMode" AS ENUM ('OPEN', 'CONNECTED_ONLY');

-- CreateEnum
CREATE TYPE "CoachClubStatus" AS ENUM ('INVITED', 'REQUESTED', 'ACTIVE', 'INACTIVE', 'REJECTED');

-- CreateEnum
CREATE TYPE "BookingType" AS ENUM ('INDIVIDUAL', 'GROUP');

-- CreateEnum
CREATE TYPE "BookingStatus" AS ENUM ('PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED');

-- CreateEnum
CREATE TYPE "MatchStatus" AS ENUM ('OPEN', 'FULL', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "TournamentStatus" AS ENUM ('DRAFT', 'REGISTRATION', 'GROUP_STAGE', 'ELIMINATION', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "TournamentMatchStatus" AS ENUM ('SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'WALKOVER', 'CANCELLED');

-- CreateEnum
CREATE TYPE "BracketRound" AS ENUM ('ROUND_OF_64', 'ROUND_OF_32', 'ROUND_OF_16', 'QUARTERFINAL', 'SEMIFINAL', 'FINAL');

-- CreateEnum
CREATE TYPE "ConnectionType" AS ENUM ('PLAYER_CLUB', 'PLAYER_COACH', 'ORGANIZER_CLUB');

-- CreateEnum
CREATE TYPE "ConnectionStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED', 'BLOCKED');

-- CreateEnum
CREATE TYPE "ClubApprovalStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "IdentityStatus" AS ENUM ('NOT_STARTED', 'PENDING', 'VERIFIED', 'REJECTED');

-- CreateEnum
CREATE TYPE "AuthProvider" AS ENUM ('LOCAL', 'GOOGLE');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('REGISTRATION', 'RESERVATION_CREATED', 'RESERVATION_CANCELLED', 'RESERVATION_REMINDER', 'CLASS_BOOKED', 'CLASS_PRE_APPROVED', 'CLASS_APPROVED', 'COACH_INVITED', 'COACH_ACCEPTED', 'COACH_REJECTED', 'TOURNAMENT_REGISTERED', 'MATCH_SCHEDULED', 'FIXTURE_CHANGED', 'RESULT_UPLOADED', 'MATCH_INVITATION', 'CONNECTION_REQUEST', 'CONNECTION_ACCEPTED', 'CONNECTION_REJECTED', 'CLUB_APPROVED', 'CLUB_REJECTED', 'CHALLENGE_RECEIVED', 'OTP_CODE', 'GENERAL');

-- CreateEnum
CREATE TYPE "NotificationChannel" AS ENUM ('IN_APP', 'EMAIL', 'WHATSAPP', 'SMS');

-- CreateEnum
CREATE TYPE "NotificationStatus" AS ENUM ('PENDING', 'SENT', 'FAILED', 'SKIPPED', 'READ');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "phone" TEXT,
    "avatarUrl" TEXT,
    "roles" "UserRole"[] DEFAULT ARRAY[]::"UserRole"[],
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "phoneVerified" BOOLEAN NOT NULL DEFAULT false,
    "termsAcceptedAt" TIMESTAMP(3),
    "authProvider" "AuthProvider" NOT NULL DEFAULT 'LOCAL',
    "googleId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "identityStatus" "IdentityStatus" NOT NULL DEFAULT 'NOT_STARTED',
    "identityDocUrl" TEXT,
    "identityVerifiedAt" TIMESTAMP(3),
    "otpCode" TEXT,
    "otpExpiresAt" TIMESTAMP(3),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "player_profiles" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "city" TEXT,
    "state" TEXT,
    "bio" TEXT,
    "hand" "HandPreference",
    "sports" "Sport"[] DEFAULT ARRAY[]::"Sport"[],
    "padelLevel" DOUBLE PRECISION,
    "tennisLevel" DOUBLE PRECISION,
    "padelCategory" TEXT,
    "tennisCategory" TEXT,
    "preferredPosition" TEXT,
    "showPhoneToOrganizers" BOOLEAN NOT NULL DEFAULT false,
    "matchesPlayed" INTEGER NOT NULL DEFAULT 0,
    "matchesWon" INTEGER NOT NULL DEFAULT 0,
    "matchesLost" INTEGER NOT NULL DEFAULT 0,
    "setsWon" INTEGER NOT NULL DEFAULT 0,
    "setsLost" INTEGER NOT NULL DEFAULT 0,
    "gamesWon" INTEGER NOT NULL DEFAULT 0,
    "gamesLost" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "player_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "coach_profiles" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "bio" TEXT,
    "sports" "Sport"[] DEFAULT ARRAY[]::"Sport"[],
    "experience" TEXT,
    "certifications" TEXT,
    "pricePerHour" DOUBLE PRECISION,
    "groupPrice" DOUBLE PRECISION,
    "isPublic" BOOLEAN NOT NULL DEFAULT true,
    "requireConnection" BOOLEAN NOT NULL DEFAULT true,
    "autoAcceptAll" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "coach_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "organizer_profiles" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "bio" TEXT,
    "freeTournamentsUsed" INTEGER NOT NULL DEFAULT 0,
    "freeTournamentsLimit" INTEGER NOT NULL DEFAULT 5,
    "referralCount" INTEGER NOT NULL DEFAULT 0,
    "referralCode" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "organizer_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "connections" (
    "id" TEXT NOT NULL,
    "fromUserId" TEXT NOT NULL,
    "toUserId" TEXT NOT NULL,
    "type" "ConnectionType" NOT NULL,
    "status" "ConnectionStatus" NOT NULL DEFAULT 'PENDING',
    "clubId" TEXT,
    "coachId" TEXT,
    "message" TEXT,
    "respondedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "connections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "coach_auto_accepts" (
    "id" TEXT NOT NULL,
    "coachId" TEXT NOT NULL,
    "playerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "coach_auto_accepts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "coach_student_reviews" (
    "id" TEXT NOT NULL,
    "coachId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "comment" TEXT NOT NULL,
    "isWarning" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "coach_student_reviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "club_profiles" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "website" TEXT,
    "logoUrl" TEXT,
    "imageUrl" TEXT,
    "sports" "Sport"[] DEFAULT ARRAY[]::"Sport"[],
    "approvalStatus" "ClubApprovalStatus" NOT NULL DEFAULT 'PENDING',
    "approvedAt" TIMESTAMP(3),
    "rejectionReason" TEXT,
    "reservationMode" "ReservationAccessMode" NOT NULL DEFAULT 'OPEN',
    "paymentMethods" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "club_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "club_locations" (
    "id" TEXT NOT NULL,
    "clubId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT,
    "country" TEXT NOT NULL DEFAULT 'Argentina',
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "phone" TEXT,
    "isMain" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "club_locations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "courts" (
    "id" TEXT NOT NULL,
    "clubId" TEXT NOT NULL,
    "locationId" TEXT,
    "name" TEXT NOT NULL,
    "sport" "Sport" NOT NULL,
    "surface" "CourtSurface" NOT NULL,
    "courtType" "CourtType" NOT NULL,
    "hasLighting" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "pricePerBlock" DOUBLE PRECISION,
    "blockDuration" INTEGER NOT NULL DEFAULT 60,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "courts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "court_availabilities" (
    "id" TEXT NOT NULL,
    "courtId" TEXT NOT NULL,
    "dayOfWeek" INTEGER NOT NULL,
    "openTime" TEXT NOT NULL,
    "closeTime" TEXT NOT NULL,
    "status" "CourtStatus" NOT NULL DEFAULT 'AVAILABLE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "court_availabilities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reservations" (
    "id" TEXT NOT NULL,
    "courtId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "status" "ReservationStatus" NOT NULL DEFAULT 'PENDING',
    "sport" "Sport" NOT NULL,
    "notes" TEXT,
    "price" DOUBLE PRECISION,
    "paidAt" TIMESTAMP(3),
    "cancelledAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reservations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "coach_club_links" (
    "id" TEXT NOT NULL,
    "coachId" TEXT NOT NULL,
    "clubId" TEXT NOT NULL,
    "status" "CoachClubStatus" NOT NULL DEFAULT 'INVITED',
    "message" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "coach_club_links_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "coach_availabilities" (
    "id" TEXT NOT NULL,
    "coachId" TEXT NOT NULL,
    "clubId" TEXT,
    "dayOfWeek" INTEGER NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "coach_availabilities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "coach_bookings" (
    "id" TEXT NOT NULL,
    "coachId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "clubId" TEXT,
    "date" DATE NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "type" "BookingType" NOT NULL DEFAULT 'INDIVIDUAL',
    "status" "BookingStatus" NOT NULL DEFAULT 'PENDING',
    "sport" "Sport" NOT NULL,
    "price" DOUBLE PRECISION,
    "notes" TEXT,
    "cancelledAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "coach_bookings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "matches" (
    "id" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,
    "courtId" TEXT,
    "sport" "Sport" NOT NULL,
    "date" DATE NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT,
    "maxPlayers" INTEGER NOT NULL DEFAULT 4,
    "level" DOUBLE PRECISION,
    "city" TEXT,
    "description" TEXT,
    "isPublic" BOOLEAN NOT NULL DEFAULT true,
    "status" "MatchStatus" NOT NULL DEFAULT 'OPEN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "matches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "match_participants" (
    "id" TEXT NOT NULL,
    "matchId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "team" INTEGER,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "match_participants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "match_results" (
    "id" TEXT NOT NULL,
    "matchId" TEXT NOT NULL,
    "setNumber" INTEGER NOT NULL,
    "team1Score" INTEGER NOT NULL,
    "team2Score" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "match_results_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "challenges" (
    "id" TEXT NOT NULL,
    "challengerId" TEXT NOT NULL,
    "challengedId" TEXT NOT NULL,
    "sport" "Sport" NOT NULL,
    "message" TEXT,
    "proposedDate" DATE,
    "proposedTime" TEXT,
    "status" "ConnectionStatus" NOT NULL DEFAULT 'PENDING',
    "matchId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "challenges_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tournaments" (
    "id" TEXT NOT NULL,
    "clubId" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "sport" "Sport" NOT NULL,
    "status" "TournamentStatus" NOT NULL DEFAULT 'DRAFT',
    "maxTeams" INTEGER,
    "startDate" DATE,
    "endDate" DATE,
    "registrationEnd" TIMESTAMP(3),
    "pointsPerWin" INTEGER NOT NULL DEFAULT 3,
    "pointsPerLoss" INTEGER NOT NULL DEFAULT 0,
    "pointsPerWalkover" INTEGER NOT NULL DEFAULT 1,
    "tiebreakers" TEXT[] DEFAULT ARRAY['POINTS', 'SET_DIFF', 'GAME_DIFF', 'HEAD_TO_HEAD']::TEXT[],
    "rules" TEXT,
    "isFree" BOOLEAN NOT NULL DEFAULT true,
    "isBillable" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tournaments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tournament_categories" (
    "id" TEXT NOT NULL,
    "tournamentId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "maxTeams" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tournament_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tournament_teams" (
    "id" TEXT NOT NULL,
    "tournamentId" TEXT NOT NULL,
    "categoryId" TEXT,
    "name" TEXT NOT NULL,
    "seed" INTEGER,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tournament_teams_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tournament_team_players" (
    "id" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "tournament_team_players_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tournament_groups" (
    "id" TEXT NOT NULL,
    "tournamentId" TEXT NOT NULL,
    "categoryId" TEXT,
    "name" TEXT NOT NULL,
    "qualifyCount" INTEGER NOT NULL DEFAULT 2,
    "isFinalized" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tournament_groups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tournament_group_members" (
    "id" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "position" INTEGER,
    "points" INTEGER NOT NULL DEFAULT 0,
    "matchesPlayed" INTEGER NOT NULL DEFAULT 0,
    "matchesWon" INTEGER NOT NULL DEFAULT 0,
    "matchesLost" INTEGER NOT NULL DEFAULT 0,
    "matchesDrawn" INTEGER NOT NULL DEFAULT 0,
    "setsWon" INTEGER NOT NULL DEFAULT 0,
    "setsLost" INTEGER NOT NULL DEFAULT 0,
    "gamesWon" INTEGER NOT NULL DEFAULT 0,
    "gamesLost" INTEGER NOT NULL DEFAULT 0,
    "isQualified" BOOLEAN NOT NULL DEFAULT false,
    "manualOverride" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tournament_group_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tournament_matches" (
    "id" TEXT NOT NULL,
    "tournamentId" TEXT NOT NULL,
    "groupId" TEXT,
    "bracketId" TEXT,
    "homeTeamId" TEXT,
    "awayTeamId" TEXT,
    "winnerId" TEXT,
    "courtId" TEXT,
    "scheduledAt" TIMESTAMP(3),
    "status" "TournamentMatchStatus" NOT NULL DEFAULT 'SCHEDULED',
    "isWalkover" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tournament_matches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tournament_match_sets" (
    "id" TEXT NOT NULL,
    "matchId" TEXT NOT NULL,
    "setNumber" INTEGER NOT NULL,
    "homeScore" INTEGER NOT NULL,
    "awayScore" INTEGER NOT NULL,

    CONSTRAINT "tournament_match_sets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tournament_brackets" (
    "id" TEXT NOT NULL,
    "tournamentId" TEXT NOT NULL,
    "categoryId" TEXT,
    "round" "BracketRound" NOT NULL,
    "position" INTEGER NOT NULL,
    "homeTeamId" TEXT,
    "awayTeamId" TEXT,
    "winnerId" TEXT,
    "isBye" BOOLEAN NOT NULL DEFAULT false,
    "isLocked" BOOLEAN NOT NULL DEFAULT false,
    "nextBracketId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tournament_brackets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "data" JSONB,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "readAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "whatsapp_notification_logs" (
    "id" TEXT NOT NULL,
    "notificationId" TEXT NOT NULL,
    "channel" "NotificationChannel" NOT NULL DEFAULT 'WHATSAPP',
    "templateName" TEXT,
    "templateParams" JSONB,
    "phoneNumber" TEXT,
    "status" "NotificationStatus" NOT NULL DEFAULT 'PENDING',
    "externalId" TEXT,
    "errorMessage" TEXT,
    "sentAt" TIMESTAMP(3),
    "deliveredAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "whatsapp_notification_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "feature_flags" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "feature_flags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "action" TEXT NOT NULL,
    "entity" TEXT NOT NULL,
    "entityId" TEXT,
    "metadata" JSONB,
    "ipAddress" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_phone_key" ON "users"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "users_googleId_key" ON "users"("googleId");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_phone_idx" ON "users"("phone");

-- CreateIndex
CREATE INDEX "users_googleId_idx" ON "users"("googleId");

-- CreateIndex
CREATE UNIQUE INDEX "player_profiles_userId_key" ON "player_profiles"("userId");

-- CreateIndex
CREATE INDEX "player_profiles_city_idx" ON "player_profiles"("city");

-- CreateIndex
CREATE INDEX "player_profiles_padelCategory_idx" ON "player_profiles"("padelCategory");

-- CreateIndex
CREATE INDEX "player_profiles_tennisCategory_idx" ON "player_profiles"("tennisCategory");

-- CreateIndex
CREATE UNIQUE INDEX "coach_profiles_userId_key" ON "coach_profiles"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "organizer_profiles_userId_key" ON "organizer_profiles"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "organizer_profiles_referralCode_key" ON "organizer_profiles"("referralCode");

-- CreateIndex
CREATE INDEX "connections_toUserId_type_status_idx" ON "connections"("toUserId", "type", "status");

-- CreateIndex
CREATE INDEX "connections_fromUserId_type_idx" ON "connections"("fromUserId", "type");

-- CreateIndex
CREATE UNIQUE INDEX "connections_fromUserId_toUserId_type_clubId_coachId_key" ON "connections"("fromUserId", "toUserId", "type", "clubId", "coachId");

-- CreateIndex
CREATE UNIQUE INDEX "coach_auto_accepts_coachId_playerId_key" ON "coach_auto_accepts"("coachId", "playerId");

-- CreateIndex
CREATE INDEX "coach_student_reviews_studentId_idx" ON "coach_student_reviews"("studentId");

-- CreateIndex
CREATE INDEX "coach_student_reviews_coachId_idx" ON "coach_student_reviews"("coachId");

-- CreateIndex
CREATE INDEX "club_profiles_ownerId_idx" ON "club_profiles"("ownerId");

-- CreateIndex
CREATE INDEX "club_profiles_approvalStatus_idx" ON "club_profiles"("approvalStatus");

-- CreateIndex
CREATE INDEX "club_locations_city_idx" ON "club_locations"("city");

-- CreateIndex
CREATE INDEX "club_locations_clubId_idx" ON "club_locations"("clubId");

-- CreateIndex
CREATE INDEX "club_locations_latitude_longitude_idx" ON "club_locations"("latitude", "longitude");

-- CreateIndex
CREATE INDEX "courts_clubId_idx" ON "courts"("clubId");

-- CreateIndex
CREATE INDEX "courts_sport_idx" ON "courts"("sport");

-- CreateIndex
CREATE UNIQUE INDEX "court_availabilities_courtId_dayOfWeek_key" ON "court_availabilities"("courtId", "dayOfWeek");

-- CreateIndex
CREATE INDEX "reservations_courtId_date_idx" ON "reservations"("courtId", "date");

-- CreateIndex
CREATE INDEX "reservations_userId_idx" ON "reservations"("userId");

-- CreateIndex
CREATE INDEX "reservations_status_idx" ON "reservations"("status");

-- CreateIndex
CREATE INDEX "coach_club_links_clubId_idx" ON "coach_club_links"("clubId");

-- CreateIndex
CREATE UNIQUE INDEX "coach_club_links_coachId_clubId_key" ON "coach_club_links"("coachId", "clubId");

-- CreateIndex
CREATE INDEX "coach_availabilities_coachId_clubId_idx" ON "coach_availabilities"("coachId", "clubId");

-- CreateIndex
CREATE INDEX "coach_bookings_coachId_date_idx" ON "coach_bookings"("coachId", "date");

-- CreateIndex
CREATE INDEX "coach_bookings_studentId_idx" ON "coach_bookings"("studentId");

-- CreateIndex
CREATE INDEX "matches_sport_status_idx" ON "matches"("sport", "status");

-- CreateIndex
CREATE INDEX "matches_city_idx" ON "matches"("city");

-- CreateIndex
CREATE INDEX "matches_date_idx" ON "matches"("date");

-- CreateIndex
CREATE UNIQUE INDEX "match_participants_matchId_userId_key" ON "match_participants"("matchId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "match_results_matchId_setNumber_key" ON "match_results"("matchId", "setNumber");

-- CreateIndex
CREATE INDEX "challenges_challengedId_status_idx" ON "challenges"("challengedId", "status");

-- CreateIndex
CREATE INDEX "challenges_challengerId_idx" ON "challenges"("challengerId");

-- CreateIndex
CREATE INDEX "tournaments_clubId_idx" ON "tournaments"("clubId");

-- CreateIndex
CREATE INDEX "tournaments_sport_status_idx" ON "tournaments"("sport", "status");

-- CreateIndex
CREATE INDEX "tournaments_createdById_idx" ON "tournaments"("createdById");

-- CreateIndex
CREATE INDEX "tournament_teams_tournamentId_idx" ON "tournament_teams"("tournamentId");

-- CreateIndex
CREATE UNIQUE INDEX "tournament_team_players_teamId_userId_key" ON "tournament_team_players"("teamId", "userId");

-- CreateIndex
CREATE INDEX "tournament_groups_tournamentId_idx" ON "tournament_groups"("tournamentId");

-- CreateIndex
CREATE UNIQUE INDEX "tournament_group_members_groupId_teamId_key" ON "tournament_group_members"("groupId", "teamId");

-- CreateIndex
CREATE INDEX "tournament_matches_tournamentId_idx" ON "tournament_matches"("tournamentId");

-- CreateIndex
CREATE INDEX "tournament_matches_groupId_idx" ON "tournament_matches"("groupId");

-- CreateIndex
CREATE INDEX "tournament_matches_bracketId_idx" ON "tournament_matches"("bracketId");

-- CreateIndex
CREATE UNIQUE INDEX "tournament_match_sets_matchId_setNumber_key" ON "tournament_match_sets"("matchId", "setNumber");

-- CreateIndex
CREATE INDEX "tournament_brackets_tournamentId_round_idx" ON "tournament_brackets"("tournamentId", "round");

-- CreateIndex
CREATE INDEX "notifications_userId_isRead_idx" ON "notifications"("userId", "isRead");

-- CreateIndex
CREATE INDEX "notifications_type_idx" ON "notifications"("type");

-- CreateIndex
CREATE UNIQUE INDEX "whatsapp_notification_logs_notificationId_key" ON "whatsapp_notification_logs"("notificationId");

-- CreateIndex
CREATE INDEX "whatsapp_notification_logs_status_idx" ON "whatsapp_notification_logs"("status");

-- CreateIndex
CREATE UNIQUE INDEX "feature_flags_key_key" ON "feature_flags"("key");

-- CreateIndex
CREATE INDEX "audit_logs_userId_idx" ON "audit_logs"("userId");

-- CreateIndex
CREATE INDEX "audit_logs_entity_entityId_idx" ON "audit_logs"("entity", "entityId");

-- CreateIndex
CREATE INDEX "audit_logs_createdAt_idx" ON "audit_logs"("createdAt");

-- AddForeignKey
ALTER TABLE "player_profiles" ADD CONSTRAINT "player_profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "coach_profiles" ADD CONSTRAINT "coach_profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organizer_profiles" ADD CONSTRAINT "organizer_profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "connections" ADD CONSTRAINT "connections_fromUserId_fkey" FOREIGN KEY ("fromUserId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "connections" ADD CONSTRAINT "connections_toUserId_fkey" FOREIGN KEY ("toUserId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "coach_auto_accepts" ADD CONSTRAINT "coach_auto_accepts_coachId_fkey" FOREIGN KEY ("coachId") REFERENCES "coach_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "coach_student_reviews" ADD CONSTRAINT "coach_student_reviews_coachId_fkey" FOREIGN KEY ("coachId") REFERENCES "coach_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "coach_student_reviews" ADD CONSTRAINT "coach_student_reviews_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "coach_student_reviews" ADD CONSTRAINT "coach_student_reviews_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "club_profiles" ADD CONSTRAINT "club_profiles_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "club_locations" ADD CONSTRAINT "club_locations_clubId_fkey" FOREIGN KEY ("clubId") REFERENCES "club_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "courts" ADD CONSTRAINT "courts_clubId_fkey" FOREIGN KEY ("clubId") REFERENCES "club_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "courts" ADD CONSTRAINT "courts_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "club_locations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "court_availabilities" ADD CONSTRAINT "court_availabilities_courtId_fkey" FOREIGN KEY ("courtId") REFERENCES "courts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reservations" ADD CONSTRAINT "reservations_courtId_fkey" FOREIGN KEY ("courtId") REFERENCES "courts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reservations" ADD CONSTRAINT "reservations_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "coach_club_links" ADD CONSTRAINT "coach_club_links_coachId_fkey" FOREIGN KEY ("coachId") REFERENCES "coach_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "coach_club_links" ADD CONSTRAINT "coach_club_links_clubId_fkey" FOREIGN KEY ("clubId") REFERENCES "club_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "coach_availabilities" ADD CONSTRAINT "coach_availabilities_coachId_fkey" FOREIGN KEY ("coachId") REFERENCES "coach_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "coach_bookings" ADD CONSTRAINT "coach_bookings_coachId_fkey" FOREIGN KEY ("coachId") REFERENCES "coach_profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "coach_bookings" ADD CONSTRAINT "coach_bookings_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "matches" ADD CONSTRAINT "matches_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "matches" ADD CONSTRAINT "matches_courtId_fkey" FOREIGN KEY ("courtId") REFERENCES "courts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "match_participants" ADD CONSTRAINT "match_participants_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "matches"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "match_participants" ADD CONSTRAINT "match_participants_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "match_results" ADD CONSTRAINT "match_results_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "matches"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "challenges" ADD CONSTRAINT "challenges_challengerId_fkey" FOREIGN KEY ("challengerId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "challenges" ADD CONSTRAINT "challenges_challengedId_fkey" FOREIGN KEY ("challengedId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tournaments" ADD CONSTRAINT "tournaments_clubId_fkey" FOREIGN KEY ("clubId") REFERENCES "club_profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tournaments" ADD CONSTRAINT "tournaments_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tournament_categories" ADD CONSTRAINT "tournament_categories_tournamentId_fkey" FOREIGN KEY ("tournamentId") REFERENCES "tournaments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tournament_teams" ADD CONSTRAINT "tournament_teams_tournamentId_fkey" FOREIGN KEY ("tournamentId") REFERENCES "tournaments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tournament_teams" ADD CONSTRAINT "tournament_teams_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "tournament_categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tournament_team_players" ADD CONSTRAINT "tournament_team_players_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "tournament_teams"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tournament_team_players" ADD CONSTRAINT "tournament_team_players_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tournament_groups" ADD CONSTRAINT "tournament_groups_tournamentId_fkey" FOREIGN KEY ("tournamentId") REFERENCES "tournaments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tournament_groups" ADD CONSTRAINT "tournament_groups_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "tournament_categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tournament_group_members" ADD CONSTRAINT "tournament_group_members_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "tournament_groups"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tournament_group_members" ADD CONSTRAINT "tournament_group_members_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "tournament_teams"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tournament_matches" ADD CONSTRAINT "tournament_matches_tournamentId_fkey" FOREIGN KEY ("tournamentId") REFERENCES "tournaments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tournament_matches" ADD CONSTRAINT "tournament_matches_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "tournament_groups"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tournament_matches" ADD CONSTRAINT "tournament_matches_bracketId_fkey" FOREIGN KEY ("bracketId") REFERENCES "tournament_brackets"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tournament_matches" ADD CONSTRAINT "tournament_matches_homeTeamId_fkey" FOREIGN KEY ("homeTeamId") REFERENCES "tournament_teams"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tournament_matches" ADD CONSTRAINT "tournament_matches_awayTeamId_fkey" FOREIGN KEY ("awayTeamId") REFERENCES "tournament_teams"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tournament_matches" ADD CONSTRAINT "tournament_matches_winnerId_fkey" FOREIGN KEY ("winnerId") REFERENCES "tournament_teams"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tournament_matches" ADD CONSTRAINT "tournament_matches_courtId_fkey" FOREIGN KEY ("courtId") REFERENCES "courts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tournament_match_sets" ADD CONSTRAINT "tournament_match_sets_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "tournament_matches"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tournament_brackets" ADD CONSTRAINT "tournament_brackets_tournamentId_fkey" FOREIGN KEY ("tournamentId") REFERENCES "tournaments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tournament_brackets" ADD CONSTRAINT "tournament_brackets_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "tournament_categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tournament_brackets" ADD CONSTRAINT "tournament_brackets_homeTeamId_fkey" FOREIGN KEY ("homeTeamId") REFERENCES "tournament_teams"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tournament_brackets" ADD CONSTRAINT "tournament_brackets_awayTeamId_fkey" FOREIGN KEY ("awayTeamId") REFERENCES "tournament_teams"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tournament_brackets" ADD CONSTRAINT "tournament_brackets_winnerId_fkey" FOREIGN KEY ("winnerId") REFERENCES "tournament_teams"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "whatsapp_notification_logs" ADD CONSTRAINT "whatsapp_notification_logs_notificationId_fkey" FOREIGN KEY ("notificationId") REFERENCES "notifications"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

