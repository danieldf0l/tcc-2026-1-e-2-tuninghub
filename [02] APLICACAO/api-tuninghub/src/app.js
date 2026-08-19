import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

import usuarioRoute from './routes/usuario.routes.js';
import projetoRoute from './routes/projeto.routes.js';
import oficinaRoute from './routes/oficina.routes.js';
import adminRoute from './routes/admin.routes.js';
import authRoute from './routes/auth.routes.js';
import imagemRoute from './routes/imagem.routes.js';
import assinaturaRoute from './routes/assinatura.routes.js';
import servicoRoute from './routes/servico.routes.js';
import planoRoute from './routes/plano.routes.js';

import enderecoRoute from './routes/endereco.routes.js';
import modeloRoute from './routes/modelo.routes.js';
import montadoraRoute from './routes/montadora.routes.js';
import projetoServicoRoute from './routes/projetoServico.routes.js';
import logSistemaRoute from './routes/logSistema.routes.js';
import oficinaServicoRoute from './routes/oficinaServico.routes.js';
import estiloServicoSugeridoRoute from './routes/estiloServicoSugerido.routes.js';

import { errorHandler, notFoundHandler } from './middlewares/error.middleware.js';
import { authLimiter } from './middlewares/rateLimiter.middleware.js';

import geolocalizacaoRoute from './routes/geolocalizacao.routes.js';

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middlewares de Segurança e Configuração
app.use(helmet()); // Protege cabeçalhos HTTP
app.use(cors()); // Habilita Cross-Origin Resource Sharing
app.use(express.json({ limit: '10mb' })); // Permite ler JSON no corpo da requisição (req.body), com limite de tamanho

// Rotas
app.use('/api/auth', authLimiter, authRoute); // rate limit aplicado só no login/registro

app.use('/api/assinatura', assinaturaRoute);
app.use('/api/usuario', usuarioRoute);
app.use('/api/projeto', projetoRoute);
app.use('/api/oficina', oficinaRoute);
app.use('/api/plano', planoRoute);
app.use('/api/imagem', imagemRoute);
app.use('/api/servico', servicoRoute);
app.use('/api/admin', adminRoute);

app.use('/api/endereco', enderecoRoute);
app.use('/api/montadora', montadoraRoute);
app.use('/api/modelo', modeloRoute);
app.use('/api/projetoServico', projetoServicoRoute);
app.use('/api/logSistema', logSistemaRoute);
app.use('/api/oficinaServico', oficinaServicoRoute);
app.use('/api/estiloservicosugerido', estiloServicoSugeridoRoute);
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.use('/api/geolocalizacao', geolocalizacaoRoute);

// Rota não encontrada (404) — deve vir depois de todas as rotas
app.use(notFoundHandler);

// Middleware de Erros DEVE ser o último
app.use(errorHandler);

export default app;