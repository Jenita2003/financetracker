const express = require('express');
const multer = require('multer');
const csv = require('csv-parser');
const bodyParser = require('body-parser');
const fs = require('fs');
const cors = require('cors');
const app = express();
const port = 5000;

const corsOptions = {
    origin: 'https://financetracker-frontend.vercel.app/',
    optionSuccessStatus: 200,
};
app.use(cors(corsOptions));

app.use(bodyParser.json());

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 }
});

let expenses = [];

const categories = {
    Food: ['food', 'coffee', 'tea', 'grocery', 'dining', 'restaurant', 'meal', 'cafe', 'snack', 'breakfast', 'lunch', 'dinner', 'takeout', 'fast food'],
    Transport: ['transport', 'fuel', 'gas', 'taxi', 'uber', 'bus', 'train', 'ride', 'parking', 'car', 'ride-share', 'subway'],
    Entertainment: ['entertainment', 'movie', 'film', 'show', 'concert', 'event', 'performance', 'theater', 'music', 'game', 'amusement', 'tickets'],
    Health: ['health', 'medicine', 'medications','doctor', 'clinic', 'hospital', 'prescription', 'treatment', 'pharmacy', 'wellness', 'checkup', 'therapy', 'dentist'],
    Shopping: ['shopping', 'clothes', 'apparel', 'fashion', 'retail', 'store', 'boutique', 'purchase', 'buy', 'accessories', 'footwear', 'jewelry'],
    Bills: ['bill', 'electricity','loan', 'water', 'gas', 'utility', 'internet', 'phone', 'mobile', 'cable', 'rent', 'mortgage', 'insurance', 'subscription'],
    Education: ['education', 'school', 'college', 'university', 'tuition', 'course', 'class', 'training', 'workshop', 'seminar', 'exam', 'books', 'supplies'],
    Travel: ['travel', 'flight', 'airfare', 'ticket', 'hotel', 'accommodation', 'holiday', 'vacation', 'trip', 'cruise', 'resort', 'tour', 'journey', 'airbnb'],
    Miscellaneous: []
};

const categorizeExpense = (description) => {
    const desc = description.toLowerCase();

    for (const category in categories) {
        const keywords = categories[category];
        for (const keyword of keywords) {
            if (desc.includes(keyword)) {
                return category;
            }
        }
    }

    return 'Miscellaneous';
};

app.post('/api/upload', upload.single('file'), (req, res) => {
    const results = {};
    fs.createReadStream(req.file.path)
        .pipe(csv())
        .on('data', (data) => {
            try {
                const category = categorizeExpense(data.Description);
                const amount = parseFloat(data.Amount);

                if (!results[category]) {
                    results[category] = 0;
                }

                results[category] += amount;
            } catch (err) {
                console.error('Error processing CSV data:', err);
            }
        })
        .on('end', () => {
            console.log('CSV processing complete. Results:', results);
            res.json({ message: 'File uploaded and processed successfully', results });
        })
        .on('error', (err) => {
            console.error('Error reading CSV file:', err);
            res.status(500).json({ message: 'Failed to process the file', error: err.message });
        });
});

app.get('/api/expenses', (req, res) => {
    res.json(expenses);
});

app.post('/api/expenses', (req, res) => {
    const { description, amount, date, title } = req.body;

    if (!description || !amount || !date || !title) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    const category = categorizeExpense(description);
    const expense = { title, description, amount: parseFloat(amount), date: new Date(date), category };
    expenses.push(expense);

    res.status(201).json({ message: 'Expense added successfully', expense });
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
