const fs = require('fs');

// Helper to parse CSV line respecting quotes
function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"' && (i === 0 || line[i-1] !== '\\')) {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current);
  return result;
}

// Clean field name - remove non-ASCII and control characters
function cleanFieldName(name) {
  return name.replace(/[^\x20-\x7E]/g, '').trim();
}

// Clean value - remove extra quotes, keep dates as strings
function cleanValue(value, header) {
  if (value === '' || value === '""' || value === null || value === undefined) {
    return undefined;
  }
  
  // Remove surrounding quotes and control chars
  value = value.replace(/^"+|"+$/g, '').replace(/[^\x20-\x7E\n\r\t]/g, '').trim();
  
  if (value === '') return undefined;
  
  // Handle arrays
  if (value === '[]') return [];
  if (value.startsWith('[') && value.endsWith(']')) {
    try { return JSON.parse(value); } catch { return []; }
  }
  
  // Handle booleans
  if (value === 'true') return true;
  if (value === 'false') return false;
  
  // Handle numbers for specific fields
  if (['puppy_count', 'weight', 'height', 'price'].includes(header)) {
    const num = parseFloat(value);
    if (!isNaN(num)) return num;
  }
  
  // Keep dates as strings (ISO format)
  return value || undefined;
}

function convertCSVToJSONL(csvPath, tableName) {
  const content = fs.readFileSync(csvPath, 'utf-8');
  const lines = content.split('\n').filter(l => l.trim());
  
  const headers = parseCSVLine(lines[0]).map(h => cleanFieldName(h.replace(/^"|"$/g, '')));
  const records = [];
  
  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    const record = {};
    
    headers.forEach((header, idx) => {
      // Skip the 'id' field as Convex generates its own _id
      if (header === 'id' || !header) return;
      
      const value = cleanValue(values[idx], header);
      if (value !== undefined) {
        record[header] = value;
      }
    });
    
    // Only add if record has data
    if (Object.keys(record).length > 0) {
      records.push(record);
    }
  }
  
  // Write JSONL file
  const outputPath = `/home/user/Downloads/${tableName}.jsonl`;
  const jsonl = records.map(r => JSON.stringify(r)).join('\n');
  fs.writeFileSync(outputPath, jsonl);
  console.log(`Converted ${records.length} records to ${outputPath}`);
  return outputPath;
}

// Convert all tables
const tables = {
  'parent_dogs': 'drizzle-data-2026-01-05T08_04_54.615Z.csv',
  'customers': 'drizzle-data-2026-01-05T07_55_40.467Z.csv',
  'admin_users': 'drizzle-data-2026-01-05T07_57_34.386Z.csv',
  'gallery_photos': 'drizzle-data-2026-01-05T07_59_43.444Z.csv',
  'inquiries': 'drizzle-data-2026-01-05T08_01_07.982Z.csv',
  'litters': 'drizzle-data-2026-01-05T08_02_55.587Z.csv',
};

Object.entries(tables).forEach(([tableName, csvFile]) => {
  const csvPath = `/home/user/Downloads/${csvFile}`;
  if (fs.existsSync(csvPath)) {
    convertCSVToJSONL(csvPath, tableName);
  } else {
    console.log(`Skipping ${tableName}: file not found`);
  }
});
