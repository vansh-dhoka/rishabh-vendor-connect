import { Router } from 'express'
// Temporarily disabled AWS SDK
// import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3'
// import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

const router = Router()

// Temporarily disabled S3 client
// const s3Client = new S3Client({ region: process.env.AWS_REGION })

router.post('/sign-upload', async (req, res) => {
  const { key, contentType } = req.body || {}
  if (!key || !contentType) return res.status(400).json({ error: 'key and contentType required' })

  const command = new PutObjectCommand({
    Bucket: process.env.S3_BUCKET,
    Key: key,
    ContentType: contentType
  })

  try {
    const url = await getSignedUrl(s3Client, command, { expiresIn: 60 })
    res.json({ url, key })
  } catch (e) {
    res.status(500).json({ error: 'failed_to_sign', detail: e?.message })
  }
})

router.get('/sign-download', async (req, res) => {
  const { key } = req.query || {}
  if (!key) return res.status(400).json({ error: 'key required' })

  const command = new GetObjectCommand({
    Bucket: process.env.S3_BUCKET,
    Key: key
  })

  try {
    const url = await getSignedUrl(s3Client, command, { expiresIn: 60 })
    res.json({ url, key })
  } catch (e) {
    res.status(500).json({ error: 'failed_to_sign', detail: e?.message })
  }
})

export default router


