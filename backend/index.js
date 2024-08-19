const express = require('express');
const multer = require('multer');
const csv = require('csv-parser');
const bodyParser = require('body-parser');
const fs = require('fs');
const cors = require('cors');
const app = express();
const port = 5000;

const corsOptions = {
    origin: 'https://financetracker-frontend.vercel.app',
    optionsSuccessStatus: 200,
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
    Education: ['education', 'school', 'college', 'university', 'tuition', 'course', 'class', 'training', 'workshop', 'seminar', 'exam', 'books', 'study'],
    Miscellaneous: ['miscellaneous', 'other', 'various', 'general', 'unclassified', 'unknown', 'expense', 'item', 'expense', 'spending', 'budget']
};

app.post('/api/upload', upload.single('file'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const results = [];
        fs.createReadStream(req.file.path)
            .pipe(csv())
            .on('data', (data) => results.push(data))
            .on('end', () => {
                fs.unlinkSync(req.file.path); // Clean up the file after processing

                const categorizedResults = results.map(item => {
                    const description = item.Description ? item.Description.toLowerCase() : '';
                    let matchedCategory = 'Miscellaneous';

                    for (const [category, keywords] of Object.entries(categories)) {
                        if (keywords.some(keyword => description.includes(keyword))) {
                            matchedCategory = category;
                            break;
                        }
                    }

                    return {
                        ...item,
                        Category: matchedCategory
                    };
                });

                res.json({ results: categorizedResults });
            })
            .on('error', (error) => {
                console.error('Error reading CSV file:', error);
                res.status(500).json({ message: 'Failed to process the CSV file.' });
            });
    } catch (error) {
        console.error('Error during file upload and processing:', error);
        res.status(500).json({ message: 'An unexpected error occurred while processing the file.' });
    }
});

app.get('/api/expenses', (req, res) => {
    res.json(expenses);
});

app.post('/api/expenses', (req, res) => {
    const expense = req.body;
    expenses.push(expense);
    res.status(201).json(expense);
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
