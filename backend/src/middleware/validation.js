import { Router } from 'express'

// Input validation middleware
export function validateGSTIN(gstin) {
  if (!gstin) return true // Optional field
  const gstinRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/
  return gstinRegex.test(gstin)
}

export function validatePAN(pan) {
  if (!pan) return true // Optional field
  const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/
  return panRegex.test(pan)
}

export function validateHSNCode(hsn) {
  if (!hsn) return true // Optional field
  const hsnRegex = /^[0-9]{4,8}$/
  return hsnRegex.test(hsn)
}

export function validateGSTRate(rate) {
  if (rate === null || rate === undefined) return true
  const numRate = Number(rate)
  return !isNaN(numRate) && numRate >= 0 && numRate <= 28
}

export function validateAmount(amount) {
  if (amount === null || amount === undefined) return true
  const numAmount = Number(amount)
  return !isNaN(numAmount) && numAmount >= 0
}

export function validateStringLength(str, maxLength = 255) {
  if (!str) return true
  return String(str).length <= maxLength
}

// File upload validation
export function validateFileType(filename, allowedTypes = ['.pdf', '.jpg', '.jpeg', '.png']) {
  if (!filename) return false
  const ext = filename.toLowerCase().substring(filename.lastIndexOf('.'))
  return allowedTypes.includes(ext)
}

export function validateFileSize(size, maxSizeMB = 10) {
  const maxSizeBytes = maxSizeMB * 1024 * 1024
  return size <= maxSizeBytes
}

// SQL injection prevention - basic parameterized query validation
export function sanitizeInput(input) {
  if (typeof input !== 'string') return input
  // Remove common SQL injection patterns
  return input.replace(/['";\\]/g, '')
}

// Rate limiting helper (would need redis or memory store in production)
const rateLimitStore = new Map()

export function rateLimit(windowMs = 60000, maxRequests = 100) {
  return (req, res, next) => {
    const key = req.ip || 'unknown'
    const now = Date.now()
    const windowStart = now - windowMs
    
    // Clean old entries
    for (const [k, v] of rateLimitStore.entries()) {
      if (v < windowStart) {
        rateLimitStore.delete(k)
      }
    }
    
    const requests = rateLimitStore.get(key) || []
    const recentRequests = requests.filter(time => time > windowStart)
    
    if (recentRequests.length >= maxRequests) {
      return res.status(429).json({ error: 'rate_limit_exceeded' })
    }
    
    recentRequests.push(now)
    rateLimitStore.set(key, recentRequests)
    next()
  }
}
