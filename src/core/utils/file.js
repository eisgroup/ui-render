import csv from 'papaparse'
import { removeEmptyValues, } from './object.js'

/**
 * FILE HANDLING FUNCTIONS =====================================================
 * =============================================================================
 */

/**
 * Get List of Row Data from CSV File
 *
 * @param {Object} file - from input
 * @param {Object} [options] - config
 * @return {Promise<Array>} - list of data for each row in CSV, with keys matching column names if header row exists
 */
export function dataFromCsv (file, options = {
  header: true,
  trimHeader: true,
  dynamicTyping: true,
  skipEmptyLines: true
}) {
  return new Promise((resolve, error) => {
    csv.parse(file, {
      ...options,
      complete ({data}) {resolve(removeEmptyValues(data))},
      error
    })
  })
}

