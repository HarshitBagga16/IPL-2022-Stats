import 'dotenv/config';
import { createApp } from './app';

const PORT = process.env.API_PORT || 3001;

const app = createApp();

app.listen(PORT, () => {
  console.log(`🏏 IPL API Server running on http://localhost:${PORT}`);
  console.log(`📚 Swagger UI: http://localhost:${PORT}/api-docs`);
});
