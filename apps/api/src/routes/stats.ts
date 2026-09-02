import { Router, Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';
import { successResponse } from '../utils/pagination';

const router = Router();

/**
 * @swagger
 * /api/stats/batting:
 *   get:
 *     summary: Get batting leaderboard
 *     tags: [Stats]
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [most_runs, most_sixes, most_fours, most_centuries, most_fifties, highest_average, highest_sr]
 *         description: Stat type (default most_runs)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 */
router.get('/batting', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const statType = String(req.query.type || 'most_runs');
    const limit = Math.min(50, Number(req.query.limit) || 20);
    const orderField = statType === 'most_runs' ? 'runs' : statType === 'most_sixes' ? 'sixes' : statType === 'most_fours' ? 'fours' : statType === 'highest_average' ? 'average' : statType === 'most_centuries' ? 'centuries' : 'runs';
    const stats = await prisma.battingStat.findMany({
      where: { statType },
      take: limit,
      orderBy: { [orderField]: 'desc' },
      include: { player: true, team: true },
    });
    res.json(successResponse(stats));
  } catch (e) { next(e); }
});

/**
 * @swagger
 * /api/stats/bowling:
 *   get:
 *     summary: Get bowling leaderboard
 *     tags: [Stats]
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [top_wickets, best_average, best_economy, best_sr, five_wickets, most_maidens]
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 */
router.get('/bowling', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const statType = String(req.query.type || 'top_wickets');
    const limit = Math.min(50, Number(req.query.limit) || 20);
    const orderField = statType === 'top_wickets' ? 'wickets' : statType === 'best_economy' ? 'economy' : statType === 'best_average' ? 'average' : 'wickets';
    const stats = await prisma.bowlingStat.findMany({
      where: { statType },
      take: limit,
      orderBy: { [orderField]: 'desc' },
      include: { player: true, team: true },
    });
    res.json(successResponse(stats));
  } catch (e) { next(e); }
});

/**
 * @swagger
 * /api/stats/overview:
 *   get:
 *     summary: Get overall tournament overview stats
 *     tags: [Stats]
 */
router.get('/overview', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const [totalMatches, totalTeams, totalPlayers, topBatsman, topBowler] = await Promise.all([
      prisma.match.count(),
      prisma.team.count(),
      prisma.player.count(),
      prisma.battingStat.findFirst({
        where: { statType: 'most_runs' },
        orderBy: { runs: 'desc' },
        include: { player: true, team: true },
      }),
      prisma.bowlingStat.findFirst({
        where: { statType: 'top_wickets' },
        orderBy: { wickets: 'desc' },
        include: { player: true, team: true },
      }),
    ]);
    res.json(successResponse({ totalMatches, totalTeams, totalPlayers, topBatsman, topBowler, season: '2022', tournament: 'Indian Premier League' }));
  } catch (e) { next(e); }
});

/**
 * @swagger
 * /api/stats/toss:
 *   get:
 *     summary: Toss win vs match win analysis
 *     tags: [Stats]
 */
router.get('/toss', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const matches = await prisma.match.findMany({
      select: { tossWinnerId: true, winningTeamId: true, tossDecision: true },
      where: { winningTeamId: { not: null } },
    });
    const total = matches.length;
    const tossWinMatchWin = matches.filter((m: any) => m.tossWinnerId === m.winningTeamId).length;
    const batFirst = matches.filter((m: any) => m.tossDecision === 1).length;
    const fieldFirst = matches.filter((m: any) => m.tossDecision === 2).length;
    const batFirstWins = matches.filter((m: any) => m.tossDecision === 1 && m.tossWinnerId === m.winningTeamId).length;
    const fieldFirstWins = matches.filter((m: any) => m.tossDecision === 2 && m.tossWinnerId === m.winningTeamId).length;
    res.json(successResponse({
      total,
      tossWinMatchWin,
      tossWinMatchWinPct: ((tossWinMatchWin / total) * 100).toFixed(1),
      batFirst,
      fieldFirst,
      batFirstWins,
      fieldFirstWins,
      chosenBatFirstWinPct: batFirst > 0 ? ((batFirstWins / batFirst) * 100).toFixed(1) : '0',
      chosenFieldFirstWinPct: fieldFirst > 0 ? ((fieldFirstWins / fieldFirst) * 100).toFixed(1) : '0',
    }));
  } catch (e) { next(e); }
});

export default router;
