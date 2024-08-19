import React from 'react';

const TransactionList = ({ transactions }) => {
  return (
    <div id="transactions">
      {transactions.length > 0 ? (
        transactions.map((transaction, index) => (
          <div key={index} className="transaction">
            <span className="transaction-description">{transaction.description}</span>
            <span className="transaction-amount">{transaction.amount.toFixed(2)}</span>
            <span className="transaction-category">{transaction.category}</span>
          </div>
        ))
      ) : (
        <p>No transactions found.</p>
      )}
    </div>
  );
};

export default TransactionList;
