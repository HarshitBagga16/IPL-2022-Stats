import { Router, Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';
import { successResponse } from '../utils/pagination';

const router = Router();

/**
 * @swagger
 * /api/standings:
 *   get:
 *     summary: Get IPL 2022 points table
 *     tags: [Standings]
 *     responses:
 *       200:
 *         description: Points table ordered by points and net run rate
 */
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const standings = await prisma.standing.findMany({
      orderBy: [{ points: 'desc' }, { netRunRate: 'desc' }],
      include: { team: true },
    });
    res.json(successResponse(standings));
  } catch (e) { next(e); }
});

export default router;
