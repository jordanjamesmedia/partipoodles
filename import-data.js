// Import data to Convex using the HTTP API
const fs = require('fs');
const path = require('path');

const CONVEX_URL = 'https://dapper-warthog-727.convex.cloud';

// Parse CSV to JSON
function parseCSV(csvContent) {
  const lines = csvContent.trim().split('\n');
  const headers = parseCSVLine(lines[0]);
  const data = [];
  
  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    const obj = {};
    headers.forEach((header, index) => {
      let value = values[index] || '';
      // Clean up the value
      value = value.replace(/^""|""$/g, '').replace(/""/g, '"');
      if (value && value !== '""' && value !== '') {
        // Try to parse as JSON if it looks like JSON
        if (value.startsWith('[') || value.startsWith('{')) {
          try {
            obj[header] = JSON.parse(value);
          } catch (e) {
            obj[header] = value;
          }
        } else if (value === 'true') {
          obj[header] = true;
        } else if (value === 'false') {
          obj[header] = false;
        } else if (!isNaN(value) && value !== '') {
          obj[header] = Number(value);
        } else {
          obj[header] = value;
        }
      }
    });
    // Remove the id field as Convex generates its own
    delete obj.id;
    data.push(obj);
  }
  return data;
}

function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim().replace(/^"|"$/g, ''));
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim().replace(/^"|"$/g, ''));
  return result;
}

// Read and parse the CSV files
const downloadsDir = '/home/user/Downloads';
const files = fs.readdirSync(downloadsDir).filter(f => f.startsWith('drizzle-data'));

console.log('Found CSV files:', files);

// Map files to table names based on content analysis
files.forEach(file => {
  const content = fs.readFileSync(path.join(downloadsDir, file), 'utf-8');
  const firstLine = content.split('\n')[0];
  console.log(`\nFile: ${file}`);
  console.log(`Headers: ${firstLine.substring(0, 100)}...`);
  
  const data = parseCSV(content);
  console.log(`Records: ${data.length}`);
  if (data.length > 0) {
    console.log('Sample record:', JSON.stringify(data[0], null, 2).substring(0, 300));
  }
});
