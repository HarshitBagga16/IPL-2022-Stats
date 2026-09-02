import { Router, Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';
import { getPagination, buildMeta, successResponse } from '../utils/pagination';
import { AppError } from '../middleware/errorHandler';

const router = Router();

/**
 * @swagger
 * /api/teams:
 *   get:
 *     summary: Get all IPL teams
 *     tags: [Teams]
 *     responses:
 *       200:
 *         description: List of all teams
 */
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const teams = await prisma.team.findMany({
      orderBy: { name: 'asc' },
      include: {
        standing: true,
        _count: { select: { matchesAsTeamA: true, matchesAsTeamB: true } },
      },
    });
    res.json(successResponse(teams));
  } catch (e) { next(e); }
});

/**
 * @swagger
 * /api/teams/{id}:
 *   get:
 *     summary: Get a team by ID
 *     tags: [Teams]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 */
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) throw new AppError('Invalid team ID', 400);
    const team = await prisma.team.findUnique({
      where: { id },
      include: {
        standing: true,
        squadPlayers: { include: { player: true } },
        _count: { select: { matchesWon: true, matchesAsTeamA: true, matchesAsTeamB: true } },
      },
    });
    if (!team) throw new AppError('Team not found', 404);
    res.json(successResponse(team));
  } catch (e) { next(e); }
});

/**
 * @swagger
 * /api/teams/{id}/matches:
 *   get:
 *     summary: Get matches for a team
 *     tags: [Teams]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 */
router.get('/:id/matches', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) throw new AppError('Invalid team ID', 400);
    const { skip, take, page, limit } = getPagination(req.query);
    const where = { OR: [{ teamAId: id }, { teamBId: id }] };
    const [total, matches] = await Promise.all([
      prisma.match.count({ where }),
      prisma.match.findMany({
        where,
        skip, take,
        orderBy: { dateStart: 'desc' },
        include: { teamA: true, teamB: true, venue: true, winner: true },
      }),
    ]);
    res.json(successResponse({ matches, meta: buildMeta(total, page, limit) }));
  } catch (e) { next(e); }
});

/**
 * @swagger
 * /api/teams/{id}/stats:
 *   get:
 *     summary: Get stats for a team
 *     tags: [Teams]
 */
router.get('/:id/stats', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) throw new AppError('Invalid team ID', 400);
    const team = await prisma.team.findUnique({
      where: { id },
      include: {
        standing: true,
        battingStats: { where: { statType: 'most_runs' }, include: { player: true }, orderBy: { runs: 'desc' }, take: 5 },
        bowlingStats: { where: { statType: 'top_wickets' }, include: { player: true }, orderBy: { wickets: 'desc' }, take: 5 },
        _count: { select: { matchesWon: true } },
      },
    });
    if (!team) throw new AppError('Team not found', 404);
    const totalMatches = await prisma.match.count({ where: { OR: [{ teamAId: id }, { teamBId: id }] } });
    res.json(successResponse({ ...team, totalMatches }));
  } catch (e) { next(e); }
});

export default router;
