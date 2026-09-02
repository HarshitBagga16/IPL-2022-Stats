import { Router, Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';
import { getPagination, buildMeta, successResponse } from '../utils/pagination';
import { AppError } from '../middleware/errorHandler';

const router = Router();

/**
 * @swagger
 * /api/matches:
 *   get:
 *     summary: Get all matches with pagination and filtering
 *     tags: [Matches]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number (default 1)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Items per page (default 20, max 100)
 *       - in: query
 *         name: teamId
 *         schema:
 *           type: integer
 *         description: Filter by team ID
 *       - in: query
 *         name: venueId
 *         schema:
 *           type: integer
 *         description: Filter by venue ID
 *     responses:
 *       200:
 *         description: Paginated list of matches
 */
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { skip, take, page, limit } = getPagination(req.query);
    const { teamId, venueId, search } = req.query;
    const where: any = {};
    const andConditions: any[] = [];

    if (teamId) {
      andConditions.push({ OR: [{ teamAId: Number(teamId) }, { teamBId: Number(teamId) }] });
    }
    if (venueId) {
      andConditions.push({ venueId: Number(venueId) });
    }
    if (search && String(search).trim()) {
      const q = String(search).trim();
      andConditions.push({
        OR: [
          { title: { contains: q, mode: 'insensitive' } },
          { shortTitle: { contains: q, mode: 'insensitive' } },
          { subtitle: { contains: q, mode: 'insensitive' } },
          { statusNote: { contains: q, mode: 'insensitive' } },
          { result: { contains: q, mode: 'insensitive' } },
          { teamA: { name: { contains: q, mode: 'insensitive' } } },
          { teamA: { shortName: { contains: q, mode: 'insensitive' } } },
          { teamB: { name: { contains: q, mode: 'insensitive' } } },
          { teamB: { shortName: { contains: q, mode: 'insensitive' } } },
          { venue: { name: { contains: q, mode: 'insensitive' } } },
          { venue: { location: { contains: q, mode: 'insensitive' } } },
        ],
      });
    }

    if (andConditions.length > 0) {
      where.AND = andConditions;
    }

    const [total, matches] = await Promise.all([
      prisma.match.count({ where }),
      prisma.match.findMany({
        where, skip, take,
        orderBy: { dateStart: 'asc' },
        include: { teamA: true, teamB: true, venue: true, winner: true, tossWinner: true },
      }),
    ]);
    res.json(successResponse({ matches, meta: buildMeta(total, page, limit) }));
  } catch (e) { next(e); }
});

/**
 * @swagger
 * /api/matches/{id}:
 *   get:
 *     summary: Get a match by ID
 *     tags: [Matches]
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
    if (isNaN(id)) throw new AppError('Invalid match ID', 400);
    const match = await prisma.match.findUnique({
      where: { id },
      include: { teamA: true, teamB: true, venue: true, winner: true, tossWinner: true },
    });
    if (!match) throw new AppError('Match not found', 404);
    res.json(successResponse(match));
  } catch (e) { next(e); }
});

export default router;
