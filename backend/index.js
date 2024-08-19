const express = require('express');
const multer = require('multer');
const csv = require('csv-parser');
const bodyParser = require('body-parser');
const fs = require('fs');

const app = express();
const port = 5000;

const corsOptions={
    origin:'https://financetracker-frontend.vercel.app/',
    optionSuccessStatus:200,
  };
  app.use(cors(corsOptions));

app.use(bodyParser.json());

// Storage configuration for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

// Configure Multer with file size limit
const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 } // 10 MB limit
});

let expenses = [];

// Function to categorize expense based on description
const categories = {
    Food: ['food', 'coffee', 'tea', 'grocery', 'dining', 'restaurant', 'meal', 'cafe', 'snack', 'breakfast', 'lunch', 'dinner', 'takeout', 'fast food'],
    Transport: ['transport', 'fuel', 'gas', 'taxi', 'uber', 'bus', 'train', 'ride', 'parking', 'car', 'ride-share', 'subway'],
    Entertainment: ['entertainment', 'movie', 'film', 'show', 'concert', 'event', 'performance', 'theater', 'music', 'game', 'amusement', 'tickets'],
    Health: ['health', 'medicine', 'medications','doctor', 'clinic', 'hospital', 'prescription', 'treatment', 'pharmacy', 'wellness', 'checkup', 'therapy', 'dentist'],
    Shopping: ['shopping', 'clothes', 'apparel', 'fashion', 'retail', 'store', 'boutique', 'purchase', 'buy', 'accessories', 'footwear', 'jewelry'],
    Bills: ['bill', 'electricity','loan', 'water', 'gas', 'utility', 'internet', 'phone', 'mobile', 'cable', 'rent', 'mortgage', 'insurance', 'subscription'],
    Education: ['education', 'school', 'college', 'university', 'tuition', 'course', 'class', 'training', 'workshop', 'seminar', 'exam', 'books', 'supplies'],
    Travel: ['travel', 'flight', 'hotel', 'accommodation', 'airfare', 'vacation', 'holiday', 'tour', 'cruise', 'reservation', 'booking', 'passport', 'visa'],
    Home: ['home', 'furniture', 'appliance', 'decor', 'renovation', 'repair', 'maintenance', 'cleaning', 'gardening', 'tool', 'equipment'],
    Technology: ['tech', 'technology', 'software', 'hardware', 'computer', 'laptop', 'phone', 'tablet', 'gadget', 'electronics', 'app', 'subscription', 'license'],
    Charity: ['charity', 'donation', 'contribution', 'fundraising', 'support', 'aid', 'relief', 'nonprofit', 'volunteer', 'cause', 'foundation', 'campaign'],
    PersonalCare: ['personal care', 'haircut', 'spa', 'salon', 'cosmetics', 'skincare', 'makeup', 'manicure', 'pedicure', 'fragrance', 'hygiene', 'wellness'],
    Pets: ['pets', 'pet food', 'veterinary', 'vet', 'grooming', 'boarding', 'adoption', 'accessories', 'toys', 'training', 'supplies', 'pet care'],
    Investments: ['investment', 'stocks', 'bonds', 'mutual funds', 'real estate', 'property', 'crypto', 'cryptocurrency', 'savings', 'retirement', 'portfolio'],
    Utilities: ['utility', 'water', 'electricity', 'gas', 'waste', 'sewer', 'heating', 'cooling', 'solar', 'internet', 'phone', 'mobile', 'cable'],
    Groceries: ['Grocery shopping', 'supermarket', 'market', 'vegetables', 'fruits', 'meat', 'fish', 'poultry', 'dairy', 'bakery', 'snacks', 'beverages', 'household items'],
    Dining: ['dining', 'restaurant', 'takeout', 'delivery', 'food', 'beverage', 'cafe', 'brunch', 'lunch', 'dinner', 'snack', 'dessert'],
    Medical: ['medical', 'doctor', 'hospital', 'clinic', 'prescription', 'medicine', 'treatment', 'surgery', 'therapy', 'checkup', 'pharmacy'],
    Fitness: ['fitness', 'gym', 'workout', 'yoga', 'pilates', 'exercise', 'trainer', 'membership', 'class', 'equipment', 'sports', 'nutrition'],
    Childcare: ['childcare', 'babysitting', 'daycare', 'preschool', 'school', 'tuition', 'toys', 'clothing', 'books', 'activities', 'education', 'child']
};

function categorizeExpense(description) {
    if (!description) {
        return 'Miscellaneous'; // Default category if description is missing
    }

    description = description.toLowerCase();
    
    for (const [category, keywords] of Object.entries(categories)) {
        if (keywords.some(keyword => description.includes(keyword))) {
            return category;
        }
    }
    
    return 'Miscellaneous';
}


// API route for file upload
app.post('/api/upload', upload.single('file'), (req, res) => {
    console.log('File upload request received');
    console.log('File details:', req.file);

    if (!req.file) {
        console.log('No file uploaded');
        return res.status(400).json({ message: 'No file uploaded' });
    }

    const results = {};
    fs.createReadStream(req.file.path)
        .pipe(csv())
        .on('data', (data) => {
            try {
                // Validate and parse CSV data
                if (!data.Description || !data.Amount) {
                    console.error('Invalid data row:', data);
                    return;
                }

                const category = categorizeExpense(data.Description);
                const amount = parseFloat(data.Amount) || 0;

                if (category in results) {
                    results[category] += amount;
                } else {
                    results[category] = amount;
                }
            } catch (err) {
                console.error(`Error processing data row: ${err.message}`);
            }
        })
        .on('end', () => {
            console.log('CSV processing complete');
            fs.unlinkSync(req.file.path); // Clean up the uploaded file
            res.status(200).json({ message: 'CSV processed and summarized', results });
        })
        .on('error', (err) => {
            console.error(`CSV file processing error: ${err.message}`);
            res.status(500).json({ message: 'Failed to process CSV file', error: err.message });
        });
});



// API to add a new expense
app.post('/api/expenses', (req, res) => {
    const { title, amount, date, description } = req.body;
    const newExpense = {
        title,
        amount,
        date,
        description,
        category: categorizeExpense(description)
    };
    expenses.push(newExpense);
    res.status(200).json({ message: 'Expense added successfully', expense: newExpense });
});

// API to get all expenses
app.get('/api/expenses', (req, res) => {
    res.status(200).json(expenses);
});

// API to clear expenses (for testing purposes)
app.delete('/api/expenses', (req, res) => {
    expenses = [];
    res.status(200).json({ message: 'Expenses cleared' });
});

// Start the server
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
