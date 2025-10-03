import { pool } from '../db.js'

export async function checkBudgetLimits(companyId, projectId, poAmount) {
  const warnings = []
  
  // Check company budget
  const companyBudget = await pool.query(
    'select budget_limit from companies where id = $1',
    [companyId]
  )
  
  if (companyBudget.rows.length > 0) {
    const companyLimit = Number(companyBudget.rows[0].budget_limit || 0)
    if (companyLimit > 0) {
      const companySpend = await pool.query(
        'select coalesce(sum(total), 0) as spent from purchase_orders where company_id = $1 and status not in ($2, $3)',
        [companyId, 'cancelled', 'draft']
      )
      const currentSpend = Number(companySpend.rows[0].spent || 0)
      const newTotal = currentSpend + Number(poAmount)
      
      if (newTotal > companyLimit) {
        warnings.push({
          type: 'company_budget_exceeded',
          message: `PO will exceed company budget. Current: ${currentSpend}, Limit: ${companyLimit}, New Total: ${newTotal}`
        })
      } else if (newTotal > companyLimit * 0.9) {
        warnings.push({
          type: 'company_budget_warning',
          message: `PO will use ${((newTotal / companyLimit) * 100).toFixed(1)}% of company budget`
        })
      }
    }
  }
  
  // Check project budget
  if (projectId) {
    const projectBudget = await pool.query(
      'select budget_limit from projects where id = $1',
      [projectId]
    )
    
    if (projectBudget.rows.length > 0) {
      const projectLimit = Number(projectBudget.rows[0].budget_limit || 0)
      if (projectLimit > 0) {
        const projectSpend = await pool.query(
          'select coalesce(sum(total), 0) as spent from purchase_orders where project_id = $1 and status not in ($2, $3)',
          [projectId, 'cancelled', 'draft']
        )
        const currentSpend = Number(projectSpend.rows[0].spent || 0)
        const newTotal = currentSpend + Number(poAmount)
        
        if (newTotal > projectLimit) {
          warnings.push({
            type: 'project_budget_exceeded',
            message: `PO will exceed project budget. Current: ${currentSpend}, Limit: ${projectLimit}, New Total: ${newTotal}`
          })
        } else if (newTotal > projectLimit * 0.9) {
          warnings.push({
            type: 'project_budget_warning',
            message: `PO will use ${((newTotal / projectLimit) * 100).toFixed(1)}% of project budget`
          })
        }
      }
    }
  }
  
  return warnings
}

export const PO_STATUS_TRANSITIONS = {
  'draft': ['submitted', 'cancelled'],
  'submitted': ['approved', 'cancelled'],
  'approved': ['completed', 'cancelled'],
  'completed': ['cancelled'],
  'cancelled': []
}

export function validatePOStatusTransition(currentStatus, newStatus) {
  const allowedTransitions = PO_STATUS_TRANSITIONS[currentStatus] || []
  return allowedTransitions.includes(newStatus)
}
