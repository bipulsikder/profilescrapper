export function exportToCSV(filename: string, rows: any[]) {
  if (!rows || rows.length === 0) {
    console.warn('No data to export')
    return
  }

  // Define the headers we want to export
  const headers = ['Rank', 'Name', 'Location', 'Similarity Score', 'Profile URL', 'Summary']
  
  // Create CSV content
  const csv = [headers.join(',')]
  
  rows.forEach((row, index) => {
    const line = [
      index + 1, // Rank
      row.name || '',
      row.location || '',
      row.similarity ? `${Math.round(row.similarity)}%` : '',
      row.url || '',
      row.snippet || ''
    ].map(field => {
      const value = String(field ?? '')
      // Escape quotes and wrap in quotes if contains commas or newlines
      const escaped = value.replace(/"/g, '""')
      return /[",\n]/.test(escaped) ? `"${escaped}"` : escaped
    }).join(',')
    
    csv.push(line)
  })

  try {
    const blob = new Blob([csv.join('\n')], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', filename)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  } catch (error) {
    console.error('Failed to export CSV:', error)
    throw new Error('Failed to export candidates')
  }
}