# TON Wallet Explorer

A modern web-based explorer for TON blockchain wallets, inspired by Tonviewer.com. This project provides a sleek, user-friendly interface for exploring wallet addresses, viewing transaction history, and interacting with smart contracts on the TON network.

## 🌟 Features

### Authentication
- **Wallet Login**: Connect using your TON wallet address
- **Address Validation**: Automatic validation of TON address format
- **Session Management**: Secure session handling

### Wallet Dashboard
- **Balance Display**: View your wallet balance in TON and USD equivalents
- **Locked Funds Indicator**: Shows if funds are locked in wallet nodes
- **Contract Information**: Display contract type (e.g., wallet_v4r2)
- **Status Badge**: Shows wallet active/inactive status
- **Quick Address Copy**: Bold copy button for easy address sharing

### Transaction Management
- **Transaction History**: View recent transactions (incoming and outgoing)
- **Raw Transaction Data**: Access JSON representation of transactions
- **Status Tracking**: See confirmation status of each transaction
- **Transaction Details**: Hash, amount, timestamp, and addresses

### Smart Contract Interaction
- **Contract Code Display**: View FunC smart contract source code
- **Available Methods**: Browse callable contract methods
- **Method Parameters**: View parameter types and descriptions
- **Send Messages**: Compose and send messages to the contract

### UI Features
- **Header Navigation**: Logo, search bar, favorite, settings, logout
- **Modern Dark/Light Design**: Responsive and elegant interface
- **Tab System**: Easy navigation between History, Raw Data, Code, Methods, and Messages
- **Search Functionality**: Search wallets and transactions
- **Footer**: Links to About, Resources, Community, and Legal sections

## 🏗️ Project Structure

```
TonwalletEX/
├── frontend/
│   ├── index.html           # Main HTML entry point
│   ├── styles.css           # Complete styling (Tonviewer-inspired)
│   └── app.js               # Frontend application logic
├── backend/
│   ├── app.py               # Flask API server
│   └── requirements.txt      # Python dependencies
└── README.md                # This file
```

## 🚀 Quick Start

### Prerequisites
- Python 3.8+
- Node.js (optional, for serving frontend)
- Modern web browser

### Backend Setup

1. Clone the repository:
```bash
git clone https://github.com/sirfredxx1/TonwalletEX.git
cd TonwalletEX
```

2. Create virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
cd backend
pip install -r requirements.txt
```

4. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your TON API credentials
```

5. Run the server:
```bash
python app.py
```

The API will be available at `http://localhost:5000`

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Serve the files (using Python):
```bash
python -m http.server 8000
```

3. Open browser and visit:
```
http://localhost:8000
```

## 📋 API Endpoints

### Authentication
- `POST /api/wallet/login` - Authenticate wallet

### Wallet Information
- `GET /api/wallet/<address>/info` - Get wallet details
- `GET /api/wallet/<address>/balance` - Get balance in TON and USD
- `GET /api/wallet/<address>/transactions` - Get transaction history

### Smart Contract
- `GET /api/contract/<address>/methods` - Get contract methods
- `POST /api/wallet/<address>/send-message` - Send contract message

### Other
- `GET /api/ton-price` - Get current TON price
- `GET /api/search` - Search addresses and transactions
- `GET /api/health` - Health check

## 🎨 Design Features

### Color Scheme
- Primary: `#0098ea` (TON Blue)
- Secondary: `#1a1a1a` (Dark)
- Success: `#10b981` (Green)
- Danger: `#ef4444` (Red)

### Key UI Components
- **Login Card**: Centered, gradient background
- **Wallet Header**: Address display with copy functionality
- **Stat Cards**: Grid layout showing key metrics
- **Tab System**: Horizontal tabs with active state
- **Transaction Table**: Responsive data display
- **Code Block**: Syntax-highlighted contract code

## 📝 Configuration

### Environment Variables (.env)
```
TON_API_URL=https://toncenter.com/api/v2
TON_API_KEY=your_api_key_here
FLASK_ENV=development
FLASK_DEBUG=True
```

## 🔧 Customization

### Update Wallet Balance (Backend)
Edit `MOCK_WALLETS` in `backend/app.py`:
```python
MOCK_WALLETS = {
    'UQAhE3dCbzJ2cCvzj00m0S_7Jkzu0vkuQVNQU45M': {
        'balance': '0.0073',  # Update this
        'balance_usd': '0.584',  # Update this
        ...
    }
}
```

### Add Mock Transactions
Edit `MOCK_TRANSACTIONS` in `backend/app.py` to add more sample transactions.

### Styling
Modify `frontend/styles.css` to customize colors, fonts, and layouts.

## 🔐 Security Considerations

- **Wallet Address**: Only the address is stored, no private keys
- **CORS**: Configure CORS in `app.py` for production
- **API Rate Limiting**: Implement rate limiting for production
- **HTTPS**: Use HTTPS in production
- **Input Validation**: All inputs are validated server-side

## 📱 Responsive Design

The application is fully responsive and works on:
- Desktop (1400px+)
- Tablet (768px - 1399px)
- Mobile (< 768px)

## 🌐 Integration with TON Blockchain

The backend is built to integrate with:
- **TON Center API**: For real blockchain data
- **CoinGecko API**: For TON/USD price conversion
- **Custom RPC Endpoints**: For direct blockchain queries

## 📦 Dependencies

### Frontend
- Axios (for HTTP requests)
- Vanilla JavaScript (no frameworks)

### Backend
- Flask 2.3.3
- Flask-CORS 4.0.0
- Requests 2.31.0
- Python-dotenv 1.0.0

## 🐛 Troubleshooting

### CORS Issues
Make sure Flask is configured with proper CORS headers. Check `backend/app.py`.

### API Connection Error
Ensure the backend server is running and accessible at `http://localhost:5000`.

### Invalid Address Error
TON addresses must start with `UQ` or `EQ` and be at least 48 characters long.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is open source and available under the MIT License.

## 📧 Contact

For questions or support, please contact [Your Contact Information].

## 🔗 Useful Links

- [TON Official Site](https://ton.org)
- [Tonviewer](https://tonviewer.com)
- [TON Center](https://toncenter.com)
- [TON Smart Contracts](https://ton.org/docs/#/func)
- [FunC Documentation](https://ton.org/docs/#/func)

---

**Built with ❤️ for the TON Community**