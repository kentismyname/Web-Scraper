const axios = require('axios');
const cheerio = require('cheerio');

const firstNames = [
  'John', 'Jane', 'Alice', 'Robert', 'Michael', 'Emily', 'Jessica', 'William', 
  'David', 'James', 'Mary', 'Patricia', 'Linda', 'Barbara', 'Elizabeth', 
  'Jennifer', 'Maria', 'Charles', 'Joseph', 'Christopher', 'Daniel', 
  'Matthew', 'Anthony', 'Mark', 'Paul', 'Steven', 'Thomas', 'Andrew', 
  'Joshua', 'Kenneth', 'Kevin', 'Brian', 'George', 'Edward', 'Ronald', 
  'Timothy', 'Jason', 'Jeffrey', 'Deborah', 'Cynthia', 'Rebecca', 'Sharon', 
  'Susan', 'Donna', 'Carol', 'Michelle', 'Dorothy', 'Sarah', 'Angela', 
  'Melissa', 'Brenda', 'Larry', 'Ryan', 'Gary', 'Nicholas', 'Eric', 
  'Stephen', 'Scott', 'Brandon', 'Frank', 'Gregory', 'Raymond', 'Jerry', 
  'Dennis', 'Janet', 'Heather', 'Megan', 'Sandra', 'Ashley', 'Kimberly', 
  'Amy', 'Nancy', 'Laura', 'Christine', 'Julie', 'Kathleen', 'Martha', 
  'Anna', 'Lisa', 'Diana', 'Rachel', 'Brittany', 'Samantha', 'Victoria', 
  'Nicole', 'Katherine', 'Crystal', 'Erin', 'Tiffany', 'Courtney', 'Danielle'
];

const lastNames = [
  'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 
  'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 
  'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin', 
  'Lee', 'Perez', 'Thompson', 'White', 'Harris', 'Sanchez', 'Clark', 
  'Ramirez', 'Lewis', 'Robinson', 'Walker', 'Young', 'Allen', 'King', 
  'Wright', 'Scott', 'Torres', 'Nguyen', 'Hill', 'Flores', 'Green', 
  'Adams', 'Nelson', 'Baker', 'Hall', 'Rivera', 'Campbell', 'Mitchell', 
  'Carter', 'Roberts', 'Gomez', 'Phillips', 'Evans', 'Turner', 'Diaz', 
  'Parker', 'Cruz', 'Edwards', 'Collins', 'Reed', 'Stewart', 'Morris', 
  'Morales', 'Murphy', 'Cook', 'Rogers', 'Morgan', 'Peterson', 'Cooper', 
  'Bailey', 'Bell', 'Gonzales', 'Chavez', 'Bennett', 'Griffin', 'Russell'
];


function generateRandomNames(count) {
  const names = [];
  for (let i = 0; i < count; i++) {
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    names.push(`${firstName} ${lastName}`);
  }
  return names;
}

async function scrapeData(name) {
  try {
    const formattedName = name.replace(/ /g, '-');
    const url = `https://neighbor.report/${formattedName}`;
    console.log(`Scraping URL: ${url}`);

    const { data } = await axios.get(url);
    const $ = cheerio.load(data);

    const fullNames = $('.persons').map((i, el) => $(el).text().trim()).get();
    const addresses = $('.i_room').map((i, el) => {
      const addressText = $(el).text().trim().replace(/Most likely, this person is the owner of the property at /, '');
      const match = addressText.match(/^(.*?\d{5})/);
      return match ? match[0] : addressText;
    }).get();
    const phoneNumbers = $('.i_phone').map((i, el) => $(el).text().trim()).get();
    const ages = $('.age').map((i, el) => $(el).text().trim().replace(/age|,/gi, '').trim()).get();

    const scriptUrl = 'https://script.google.com/macros/s/AKfycbxhlVE8xHsm7jfaFIewdtc4fh8Z4YOv50DlcmT-gSVJ21M1vE19m3CC7uiZ0SeSbChwLw/exec'; // Your deployed Apps Script URL

    console.log('Collected Data:');
    console.log('Full Names:', fullNames);
    console.log('Ages:', ages);
    console.log('Addresses:', addresses);
    console.log('Phone Numbers:', phoneNumbers);

    const response = await axios.post(scriptUrl, {
      fullNames: JSON.stringify(fullNames),
      ages: JSON.stringify(ages),
      addresses: JSON.stringify(addresses),
      phoneNumbers: JSON.stringify(phoneNumbers),
    });
    console.log('Response from Google Apps Script:', response.data);
  } catch (error) {
    console.error('Error fetching data:', error.message);
  }
}

async function runScrapingForGeneratedNames(count) {
  const names = generateRandomNames(count);
  for (const name of names) {
    await scrapeData(name);
  }
}

runScrapingForGeneratedNames(1000); // Adjust the count as needed
