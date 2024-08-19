import './App.css';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { Bar, Pie } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

function App() {
    const [expenses, setExpenses] = useState([]);
    const [input, setInput] = useState({
        title: '',
        amount: '',
        date: new Date(),
        description: '',
    });
    const [salary, setSalary] = useState('');
    const [file, setFile] = useState(null);

    useEffect(() => {
        fetchExpenses();
    }, []);

    const fetchExpenses = async () => {
        await axios.get('https://financetracker-backend.vercel.app/api/expenses')
            .then(response => {
                setExpenses(response.data);
            })
            .catch(error => {
                console.error('There was an error!', error);
            });
    };

    const handleInputChange = (e) => {
        setInput({ ...input, [e.target.name]: e.target.value });
    };

    const handleDateChange = (date) => {
        setInput({ ...input, date });
    };

    const handleSalaryChange = (e) => {
        setSalary(e.target.value);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        await axios.post('https://financetracker-backend.vercel.app/api/expenses', input);
        fetchExpenses();
        setInput({
            title: '',
            amount: '',
            date: new Date(),
            description: '',
        });
    };

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleFileUpload = async () => {
        try {
            const formData = new FormData();
            formData.append('file', file);

            const response = await axios.post('https://financetracker-backend.vercel.app/api/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            console.log(response.data.message);

            const categories = response.data.results;
            const updatedExpenses = Object.entries(categories).map(([category, count]) => ({
                description: category,
                amount: count,
                category,
            }));

            setExpenses([...expenses, ...updatedExpenses]);

        } catch (error) {
            console.error("File upload error:", error.response ? error.response.data.message : error.message);
            alert("Failed to upload and process the file. Please check the file format and try again.");
        }
    };

    const getChartData = () => {
        const categories = expenses.reduce((acc, expense) => {
            acc[expense.category] = acc[expense.category] + parseFloat(expense.amount) || parseFloat(expense.amount);
            return acc;
        }, {});

        return {
            labels: Object.keys(categories),
            datasets: [
                {
                    label: 'Expenses by Category',
                    data: Object.values(categories),
                    backgroundColor: [
                        'rgba(255, 99, 132, 0.6)',
                        'rgba(54, 162, 235, 0.6)',
                        'rgba(255, 206, 86, 0.6)',
                        'rgba(75, 192, 192, 0.6)',
                        'rgba(153, 102, 255, 0.6)',
                        'rgba(255, 159, 64, 0.6)'
                    ],
                    barPercentage: 0.2,
                    categoryPercentage: 0.8,
                },
            ],
        };
    };

    const getPieChartData = () => {
        const totalExpenses = expenses.reduce((acc, expense) => acc + parseFloat(expense.amount), 0);
        const remainingSalary = parseFloat(salary) - totalExpenses;

        const miscCategoryTotal = expenses
            .filter(expense => expense.category === 'Miscellaneous')
            .reduce((acc, expense) => acc + parseFloat(expense.amount), 0);

        const miscCategoryProportion = miscCategoryTotal / totalExpenses;
        const miscColor = `rgba(255, 99, 132, ${Math.max(0.2, miscCategoryProportion)})`;

        return {
            labels: ['Expenses', 'Remaining Salary'],
            datasets: [
                {
                    data: [totalExpenses, remainingSalary],
                    backgroundColor: [
                        miscColor,
                        'rgba(79, 192, 192, 0.6)'
                    ],
                },
            ],
        };
    };

    return (
        <div className="background">
            <nav className="navbar">
                <h1>PERSONAL FINANCE MANAGEMENT WEB APP</h1>
            </nav>
            <div className="month">
                <h2>Enter Monthly Salary</h2>
                <input
                    type="number"
                    placeholder="Monthly Salary"
                    value={salary}
                    onChange={handleSalaryChange}
                    required
                />
            </div>
            <div className="box">
                <div className="expense">
                    <h2>Expense Tracker</h2>
                    <form onSubmit={handleSubmit}>
                        <input
                            type="text"
                            name="description"
                            placeholder="Enter your expenses.."
                            value={input.description}
                            onChange={handleInputChange}
                            required
                        />
                        <input
                            type="number"
                            name="amount"
                            placeholder="Amount"
                            value={input.amount}
                            onChange={handleInputChange}
                            required
                        />
                        <DatePicker
                            selected={input.date}
                            onChange={handleDateChange}
                        />
                        <button type="submit">Add Expense</button>
                    </form>
                </div>
            </div>
            
            <h2 className="move">Upload CSV</h2>
            <div className="csv">
                <input type="file" onChange={handleFileChange} />
                <div className="upload-button-container">
                    <button onClick={handleFileUpload}>Upload</button>
                </div>
            </div>

            <div className="category">
                <h2 className="right">Expense Categories</h2>
                <div className="bar-chart-container">
                    <Bar data={getChartData()} />
                </div>
            </div>
            
            <div className="sal">
                <h2 className="moves">Salary vs Expenses</h2>
                <div className="pie-chart-container">
                    <Pie data={getPieChartData()} />
                </div>
            </div>
        </div>
    );
}

export default App;
