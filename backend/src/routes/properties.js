import { Router } from 'express'

const router = Router()

router.get('/', async (_req, res) => {
  res.json({ items: [], total: 0 })
})

router.post('/', async (_req, res) => {
  res.status(201).json({ id: 'new_property_id' })
})

router.get('/:id', async (req, res) => {
  res.json({ id: req.params.id })
})

router.put('/:id', async (req, res) => {
  res.json({ id: req.params.id, updated: true })
})

router.delete('/:id', async (_req, res) => {
  res.status(204).send()
})

export default router


