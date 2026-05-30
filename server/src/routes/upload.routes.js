import { Router } from 'express'
import { upload } from '../middleware/upload.js'
import { handleUpload } from '../controllers/upload.controller.js'

const router = Router()

router.post('/upload', upload.single('resume'), handleUpload)

export default router
