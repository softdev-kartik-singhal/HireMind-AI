import { Router } from 'express';
import { VoiceController } from '../controllers/voiceController.js';
import { authenticate } from '../middlewares/authenticate.js';
import { uploadAudioMiddleware } from '../middlewares/voiceUploadMiddleware.js';

const router = Router();

// Candidate voice transcription & evaluation routes (Authenticated)
router.use(authenticate);

router.post('/transcribe', uploadAudioMiddleware, VoiceController.transcribe);
router.post('/submit-response', VoiceController.submitResponse);

export const voiceRoutes = router;
