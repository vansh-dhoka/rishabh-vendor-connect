import { Router } from 'express'
import AWS from 'aws-sdk'

const router = Router()

const s3 = new AWS.S3({ region: process.env.AWS_REGION })

router.post('/sign-upload', async (req, res) => {
  const { key, contentType } = req.body || {}
  if (!key || !contentType) return res.status(400).json({ error: 'key and contentType required' })

  const params = {
    Bucket: process.env.S3_BUCKET,
    Key: key,
    ContentType: contentType,
    Expires: 60
  }

  try {
    const url = await s3.getSignedUrlPromise('putObject', params)
    res.json({ url, key })
  } catch (e) {
    res.status(500).json({ error: 'failed_to_sign', detail: e?.message })
  }
})

router.get('/sign-download', async (req, res) => {
  const { key } = req.query || {}
  if (!key) return res.status(400).json({ error: 'key required' })

  const params = {
    Bucket: process.env.S3_BUCKET,
    Key: key,
    Expires: 60
  }

  try {
    const url = await s3.getSignedUrlPromise('getObject', params)
    res.json({ url, key })
  } catch (e) {
    res.status(500).json({ error: 'failed_to_sign', detail: e?.message })
  }
})

export default router


