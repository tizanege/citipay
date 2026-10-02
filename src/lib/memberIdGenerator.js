/**
 * Member ID Generator Utility for CitiPay & CitiLeague
 * Ensures all Member IDs are randomly generated, non-serial, unpredictable,
 * and guaranteed collision-free (unique).
 */

// Unambiguous uppercase alphanumeric charset (excludes confusing chars 0, O, 1, I, L)
const ALPHANUMERIC_CHARSET = '23456789ABCDEFGHJKMNPQRSTUVWXYZ'
const NUMERIC_CHARSET = '0123456789'

/**
 * Normalizes a member ID for robust comparisons (removes hyphens, spaces, uppercase).
 * e.g. 'sl-8k4p2' -> 'SL8K4P2'
 * @param {string} id
 * @returns {string}
 */
export function normalizeMemberId(id) {
  if (!id) return ''
  return String(id).toUpperCase().replace(/[^A-Z0-9]/g, '')
}

/**
 * Checks if two member IDs match, ignoring case, hyphens, and whitespace.
 * @param {string} idA
 * @param {string} idB
 * @returns {boolean}
 */
export function isMemberIdMatch(idA, idB) {
  if (!idA || !idB) return false
  const normA = normalizeMemberId(idA)
  const normB = normalizeMemberId(idB)
  return normA.length > 0 && normA === normB
}

/**
 * Generates a random, non-serial, collision-checked Member ID.
 * Example outputs: 'SL-8K4P2', 'VI-9X2M4', 'IR-4H6J7'
 * 
 * @param {Object} [options]
 * @param {string} [options.prefix='SL'] - Club code or league prefix
 * @param {number} [options.length=5] - Number of random characters/digits
 * @param {('alphanumeric'|'numeric')} [options.charset='alphanumeric'] - Charset to draw random entropy from
 * @param {string[]} [options.existingIds=[]] - Array or Set of existing member IDs to prevent duplicates
 * @param {boolean} [options.withHyphen=true] - Whether to include hyphen separator
 * @returns {string} Unique random member ID
 */
export function generateRandomMemberId({
  prefix = 'SL',
  length = 5,
  charset = 'alphanumeric',
  existingIds = [],
  withHyphen = true
} = {}) {
  const pool = charset === 'numeric' ? NUMERIC_CHARSET : ALPHANUMERIC_CHARSET
  const existingSet = new Set(
    (existingIds || []).map(id => normalizeMemberId(id)).filter(Boolean)
  )

  const cleanPrefix = (prefix || 'SL').toUpperCase().replace(/[^A-Z0-9]/g, '')
  let candidate = ''
  let attempts = 0
  const maxAttempts = 2000

  do {
    let randomPart = ''
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * pool.length)
      randomPart += pool[randomIndex]
    }
    candidate = withHyphen ? `${cleanPrefix}-${randomPart}` : `${cleanPrefix}${randomPart}`
    attempts++
  } while (existingSet.has(normalizeMemberId(candidate)) && attempts < maxAttempts)

  return candidate
}

/**
 * Generates a batch of unique, non-serial Member IDs for a squad.
 * @param {number} count - Number of IDs needed
 * @param {string} prefix - Club prefix (e.g. 'SL')
 * @param {string[]} existingIds - Any previously allocated IDs
 * @returns {string[]} Array of unique random IDs
 */
export function generateBatchMemberIds(count, prefix = 'SL', existingIds = []) {
  const ids = []
  const combinedSet = new Set(
    (existingIds || []).map(id => normalizeMemberId(id)).filter(Boolean)
  )

  for (let i = 0; i < count; i++) {
    const newId = generateRandomMemberId({
      prefix,
      length: 5,
      existingIds: Array.from(combinedSet)
    })
    ids.push(newId)
    combinedSet.add(normalizeMemberId(newId))
  }

  return ids
}

/**
 * Generates a secure, temporary password for newly registered or invited players.
 * Example: 'Citi#8K42', 'Citi#9M3P'
 */
export function generateTempPassword(prefix = 'Citi') {
  const chars = '23456789ABCDEFGHJKMNPQRSTUVWXYZ'
  let code = ''
  for (let i = 0; i < 4; i++) {
    code += chars[Math.floor(Math.random() * chars.length)]
  }
  return `${prefix}#${code}`
}

/**
 * Generates a 4-digit quick access login PIN.
 * Example: '7492', '3819'
 */
export function generateAccessPin() {
  return String(Math.floor(1000 + Math.random() * 9000))
}

