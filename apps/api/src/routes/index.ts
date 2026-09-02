import { Router } from 'express';
import teamsRouter from './teams';
import matchesRouter from './matches';
import playersRouter from './players';
import statsRouter from './stats';
import standingsRouter from './standings';

export const router = Router();

router.use('/teams', teamsRouter);
router.use('/matches', matchesRouter);
router.use('/players', playersRouter);
router.use('/stats', statsRouter);
router.use('/standings', standingsRouter);
