import { Router, Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';
import { getPagination, buildMeta, successResponse } from '../utils/pagination';
import { AppError } from '../middleware/errorHandler';

const router = Router();

/**
 * @swagger
 * /api/players:
 *   get:
 *     summary: Get all players with pagination and search
 *     tags: [Players]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search players by name
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *         description: Filter by playing role (bat/bowl/all/wk)
 *       - in: query
 *         name: teamId
 *         schema:
 *           type: integer
 */
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { skip, take, page, limit } = getPagination(req.query);
    const { search, role, teamId } = req.query;
    const where: any = {};
    if (search) where.name = { contains: String(search), mode: 'insensitive' };
    if (role) where.playingRole = { contains: String(role), mode: 'insensitive' };
    if (teamId) where.squadEntries = { some: { teamId: Number(teamId) } };
    const [total, players] = await Promise.all([
      prisma.player.count({ where }),
      prisma.player.findMany({
        where, skip, take,
        orderBy: { name: 'asc' },
        include: { squadEntries: { include: { team: true } } },
      }),
    ]);
    res.json(successResponse({ players, meta: buildMeta(total, page, limit) }));
  } catch (e) { next(e); }
});

/**
 * @swagger
 * /api/players/{id}:
 *   get:
 *     summary: Get a player by ID
 *     tags: [Players]
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
    if (isNaN(id)) throw new AppError('Invalid player ID', 400);
    const player = await prisma.player.findUnique({
      where: { id },
      include: {
        squadEntries: { include: { team: true } },
        battingStats: { include: { team: true }, orderBy: { runs: 'desc' } },
        bowlingStats: { include: { team: true }, orderBy: { wickets: 'desc' } },
      },
    });
    if (!player) throw new AppError('Player not found', 404);
    res.json(successResponse(player));
  } catch (e) { next(e); }
});

export default router;
