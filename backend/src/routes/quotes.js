import { Router } from 'express'

const router = Router()

router.get('/', async (_req, res) => {
  res.json({ items: [], total: 0 })
})

router.post('/', async (_req, res) => {
  res.status(201).json({ id: 'new_quote_id' })
})

router.get('/:id', async (_req, res) => {
  res.json({ id: _req.params.id })
})

router.put('/:id', async (_req, res) => {
  res.json({ id: _req.params.id, updated: true })
})

router.delete('/:id', async (_req, res) => {
  res.status(204).send()
})

export default router


