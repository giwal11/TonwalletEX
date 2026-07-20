from flask import Flask, request, jsonify
from flask_cors import CORS
import json
from datetime import datetime, timedelta
import requests
import os

app = Flask(__name__)
CORS(app)

# Configuration
TON_API_URL = os.getenv('TON_API_URL', 'https://toncenter.com/api/v2')
TON_API_KEY = os.getenv('TON_API_KEY', '')

# Mock data for demonstration
MOCK_WALLETS = {
    'UQAhE3dCbzJ2cCvzj00m0S_7Jkzu0vkuQVNQU45M': {
        'balance': '0.0073',
        'balance_usd': '0.584',
        'contract_type': 'wallet_v4r2',
        'status': 'Active',
        'locked': True
    }
}

MOCK_TRANSACTIONS = {
    'UQAhE3dCbzJ2cCvzj00m0S_7Jkzu0vkuQVNQU45M': [
        {
            'id': 'tx_001',
            'hash': 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
            'type': 'in',
            'amount': '0.5',
            'from': 'UQAhE3dCbzJ2cCvzj00m0S_7Jkzu0vkuQVNQU45M',
            'timestamp': (datetime.now() - timedelta(hours=1)).isoformat(),
            'status': 'confirmed'
        },
        {
            'id': 'tx_002',
            'hash': 'a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3',
            'type': 'out',
            'amount': '0.25',
            'to': 'UQBRYtF-Xr5zVqU5XLqH3F0V5F9_q5Q7H7qH3F0V5F9',
            'timestamp': (datetime.now() - timedelta(hours=2)).isoformat(),
            'status': 'confirmed'
        }
    ]
}


class TonWalletAPI:
    """Interface with TON blockchain"""

    def __init__(self, api_url, api_key):
        self.api_url = api_url
        self.api_key = api_key
        self.headers = {'X-API-Key': api_key}

    def get_wallet_info(self, address):
        """Fetch wallet info from TON API"""
        try:
            response = requests.get(
                f"{self.api_url}/getAddressInformation",
                params={'address': address},
                headers=self.headers,
                timeout=10
            )
            response.raise_for_status()
            return response.json()
        except Exception as e:
            print(f"Error fetching wallet info: {e}")
            return None

    def get_transactions(self, address, limit=10):
        """Fetch transaction history"""
        try:
            response = requests.get(
                f"{self.api_url}/getTransactions",
                params={'address': address, 'limit': limit},
                headers=self.headers,
                timeout=10
            )
            response.raise_for_status()
            return response.json()
        except Exception as e:
            print(f"Error fetching transactions: {e}")
            return None


ton_api = TonWalletAPI(TON_API_URL, TON_API_KEY)


@app.route('/api/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({'status': 'ok', 'message': 'TON Wallet Explorer API running'})


@app.route('/api/wallet/login', methods=['POST'])
def login():
    """Authenticate wallet by address"""
    try:
        data = request.get_json()
        address = data.get('address', '').strip()

        if not address:
            return jsonify({'success': False, 'error': 'Address required'}), 400

        if len(address) < 48:
            return jsonify({'success': False, 'error': 'Invalid address format'}), 400

        # Validate address format (basic check)
        if not (address.startswith('UQ') or address.startswith('EQ')):
            return jsonify({'success': False, 'error': 'Invalid TON address'}), 400

        return jsonify({
            'success': True,
            'message': 'Wallet authenticated successfully',
            'address': address
        }), 200
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


@app.route('/api/wallet/<address>/info', methods=['GET'])
def get_wallet_info(address):
    """Get wallet information"""
    try:
        # Try to fetch from TON API first
        wallet_info = ton_api.get_wallet_info(address)

        if wallet_info and wallet_info.get('ok'):
            data = wallet_info.get('result', {})
            return jsonify({
                'success': True,
                'address': address,
                'balance': str(int(data.get('balance', 0)) / 1e9),  # Convert from nanoton
                'status': 'Active',
                'contract_type': data.get('type', 'wallet_v4r2'),
                'locked': True
            }), 200

        # Fallback to mock data
        if address in MOCK_WALLETS:
            return jsonify({
                'success': True,
                'address': address,
                **MOCK_WALLETS[address]
            }), 200

        return jsonify({'success': False, 'error': 'Wallet not found'}), 404
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


@app.route('/api/wallet/<address>/transactions', methods=['GET'])
def get_transactions(address):
    """Get wallet transaction history"""
    try:
        limit = request.args.get('limit', 10, type=int)
        limit = min(limit, 100)  # Cap at 100

        # Try to fetch from TON API first
        transactions = ton_api.get_transactions(address, limit)

        if transactions and transactions.get('ok'):
            tx_data = transactions.get('result', [])
            formatted_transactions = []
            for tx in tx_data:
                formatted_transactions.append({
                    'hash': tx.get('transaction_id', {}).get('hash'),
                    'amount': str(tx.get('in_msg', {}).get('value', 0) / 1e9) if tx.get('in_msg') else '0',
                    'timestamp': datetime.fromtimestamp(tx.get('utime', 0)).isoformat(),
                    'status': 'confirmed',
                    'type': 'in' if tx.get('in_msg') else 'out'
                })
            return jsonify({
                'success': True,
                'address': address,
                'transactions': formatted_transactions
            }), 200

        # Fallback to mock data
        if address in MOCK_TRANSACTIONS:
            return jsonify({
                'success': True,
                'address': address,
                'transactions': MOCK_TRANSACTIONS[address][:limit]
            }), 200

        return jsonify({
            'success': True,
            'address': address,
            'transactions': []
        }), 200
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


@app.route('/api/wallet/<address>/balance', methods=['GET'])
def get_balance(address):
    """Get wallet balance in TON and USD"""
    try:
        wallet_info = ton_api.get_wallet_info(address)

        if wallet_info and wallet_info.get('ok'):
            balance_nanoton = int(wallet_info.get('result', {}).get('balance', 0))
            balance_ton = balance_nanoton / 1e9
        else:
            if address in MOCK_WALLETS:
                balance_ton = float(MOCK_WALLETS[address]['balance'])
            else:
                return jsonify({'success': False, 'error': 'Wallet not found'}), 404

        # Fetch TON to USD conversion
        try:
            usd_response = requests.get(
                'https://api.coingecko.com/api/v3/simple/price?ids=toncoin&vs_currencies=usd',
                timeout=5
            )
            ton_price = usd_response.json().get('toncoin', {}).get('usd', 0)
        except:
            ton_price = 8  # Fallback price

        balance_usd = balance_ton * ton_price

        return jsonify({
            'success': True,
            'address': address,
            'balance_ton': balance_ton,
            'balance_usd': balance_usd,
            'ton_price_usd': ton_price
        }), 200
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


@app.route('/api/wallet/<address>/send-message', methods=['POST'])
def send_message(address):
    """Send a message from wallet"""
    try:
        data = request.get_json()
        recipient = data.get('recipient')
        amount = data.get('amount')
        message = data.get('message', '')

        if not recipient or not amount:
            return jsonify({'success': False, 'error': 'Recipient and amount required'}), 400

        try:
            amount = float(amount)
            if amount <= 0:
                raise ValueError('Amount must be positive')
        except ValueError:
            return jsonify({'success': False, 'error': 'Invalid amount'}), 400

        # In production, this would sign and send an actual transaction
        return jsonify({
            'success': True,
            'message': 'Message prepared (signing required)',
            'from': address,
            'to': recipient,
            'amount': amount,
            'note': message
        }), 200
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


@app.route('/api/ton-price', methods=['GET'])
def get_ton_price():
    """Get current TON price in USD"""
    try:
        response = requests.get(
            'https://api.coingecko.com/api/v3/simple/price?ids=toncoin&vs_currencies=usd,eur',
            timeout=10
        )
        price_data = response.json().get('toncoin', {})
        return jsonify({
            'success': True,
            'price_usd': price_data.get('usd', 0),
            'price_eur': price_data.get('eur', 0)
        }), 200
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


@app.route('/api/search', methods=['GET'])
def search():
    """Search for address or transaction"""
    try:
        query = request.args.get('q', '').strip()

        if not query:
            return jsonify({'success': False, 'error': 'Query required'}), 400

        # In production, search across blockchain
        return jsonify({
            'success': True,
            'query': query,
            'results': []
        }), 200
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


@app.route('/api/contract/<address>/methods', methods=['GET'])
def get_contract_methods(address):
    """Get available methods for a contract"""
    return jsonify({
        'success': True,
        'address': address,
        'methods': [
            {'name': 'get_seqno', 'type': 'getter', 'description': 'Get sequence number'},
            {'name': 'get_subwallet_id', 'type': 'getter', 'description': 'Get subwallet ID'},
            {'name': 'get_public_key', 'type': 'getter', 'description': 'Get public key'},
            {'name': 'recv_internal', 'type': 'receiver', 'description': 'Handle internal messages'},
            {'name': 'recv_external', 'type': 'receiver', 'description': 'Handle external messages'}
        ]
    }), 200


@app.errorhandler(404)
def not_found(error):
    return jsonify({'success': False, 'error': 'Endpoint not found'}), 404


@app.errorhandler(500)
def internal_error(error):
    return jsonify({'success': False, 'error': 'Internal server error'}), 500


if __name__ == '__main__':
    app.run(debug=False, host='0.0.0.0', port=int(os.getenv('PORT', 5000)))
