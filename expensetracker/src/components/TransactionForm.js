import React, { useState } from 'react';

const TransactionForm = ({ addTransaction }) => {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');

  const onSubmit = async (e) => {
    e.preventDefault();
    console.log('Submitting transaction:', { description, amount });

    try {
        const response = await fetch('http://localhost:5000/categorize', { // Adjust the port if necessary
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ description })
          });

      if (!response.ok) {
        throw new Error('Failed to categorize expense');
      }

      const data = await response.json();
      console.log('Categorized data:', data);

      const category = data.category;

      addTransaction({ description, amount: parseFloat(amount), category });

      setDescription('');
      setAmount('');
    } catch (error) {
      console.error('Error adding transaction:', error);
    }
  };

  return (
    <form id="transaction-form" onSubmit={onSubmit}>
      <input
        type="text"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Enter transaction description"
        required
      />
      <input
        type="number"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        placeholder="Enter amount"
        required
      />
      <input type="submit" value="Add Transaction" />
    </form>
  );
};

export default TransactionForm;
