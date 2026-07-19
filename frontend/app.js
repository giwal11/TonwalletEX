class TonWalletExplorer {
  constructor() {
    this.app = document.getElementById('app');
    this.currentPage = 'login';
    this.walletAddress = null;
    this.walletData = null;
    this.currentTab = 'history';
    this.init();
  }

  init() {
    this.render();
  }

  render() {
    if (this.currentPage === 'login') {
      this.renderLogin();
    } else if (this.currentPage === 'wallet') {
      this.renderWallet();
    }
  }

  renderLogin() {
    this.app.innerHTML = `
      <div class="login-page">
        <div class="login-card">
          <div class="login-header">
            <div class="login-logo">⛓️</div>
            <h1 class="login-title">TON Wallet Explorer</h1>
            <p class="login-subtitle">Connect your wallet to explore</p>
          </div>
          
          <div id="error-container"></div>
          
          <form id="login-form">
            <div class="form-group">
              <label class="form-label">Wallet Address</label>
              <input 
                type="text" 
                class="form-input" 
                id="wallet-input"
                placeholder="Enter your TON wallet address"
                required
              >
            </div>
            <button type="submit" class="btn-login">Connect Wallet</button>
          </form>
          
          <div style="text-align: center; margin-top: 1.5rem; color: var(--text-secondary); font-size: 0.9rem;">
            <p>Example: UQAhE3dCbzJ2cCvzj00m0S_7Jkzu0vkuQVNQU45M..."</p>
          </div>
        </div>
      </div>
    `;

    document.getElementById('login-form').addEventListener('submit', (e) => this.handleLogin(e));
  }

  handleLogin(e) {
    e.preventDefault();
    const addressInput = document.getElementById('wallet-input');
    const address = addressInput.value.trim();
    const errorContainer = document.getElementById('error-container');

    if (!address) {
      errorContainer.innerHTML = '<div class="error-message">Please enter a wallet address</div>';
      return;
    }

    if (address.length < 48) {
      errorContainer.innerHTML = '<div class="error-message">Invalid wallet address format</div>';
      return;
    }

    this.walletAddress = address;
    this.fetchWalletData(address);
  }

  fetchWalletData(address) {
    // Simulated data - in production, this would call your backend API
    this.walletData = {
      address: address,
      balance: '0.0073', // in TON
      balanceUSD: '0.584', // USD value
      contractType: 'wallet_v4r2',
      status: 'Active',
      shortAddress: address.substring(0, 4) + '...' + address.substring(address.length - 4),
      lockedInNodes: true,
      transactions: [
        {
          id: 'tx_001',
          hash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
          type: 'in',
          amount: '0.5',
          from: 'UQAhE3dCbzJ2cCvzj00m0S_7Jkzu0vkuQVNQU45M...',
          timestamp: new Date(Date.now() - 3600000),
          status: 'confirmed'
        },
        {
          id: 'tx_002',
          hash: 'a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3',
          type: 'out',
          amount: '0.25',
          to: 'UQBRYtF-Xr5zVqU5XLqH3F0V5F9_q5Q7H7qH3F0V5F9...',
          timestamp: new Date(Date.now() - 7200000),
          status: 'confirmed'
        },
        {
          id: 'tx_003',
          hash: 'b3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b123',
          type: 'in',
          amount: '1.0',
          from: 'UQCxRxH9Xr5zVqU5XLqH3F0V5F9_q5Q7H7qH3F0V5F9...',
          timestamp: new Date(Date.now() - 86400000),
          status: 'confirmed'
        }
      ]
    };

    this.currentPage = 'wallet';
    this.render();
  }

  renderWallet() {
    this.app.innerHTML = `
      <header class="header">
        <div class="header-container">
          <div class="logo">
            <div class="logo-icon">⛓️</div>
            <span>TON Explorer</span>
          </div>
          <div class="search-container">
            <input 
              type="text" 
              class="search-input" 
              placeholder="Search by address or transaction hash"
              id="search-input"
            >
          </div>
          <div class="header-actions">
            <button class="icon-btn" id="favorite-btn" title="Add to favorites">⭐</button>
            <button class="icon-btn" id="settings-btn" title="Settings">⚙️</button>
            <button class="btn-primary" id="logout-btn">Logout</button>
          </div>
        </div>
      </header>

      <div class="wallet-container">
        ${this.renderWalletHeader()}
        ${this.renderTabs()}
      </div>

      ${this.renderFooter()}
    `;

    this.attachEventListeners();
  }

  renderWalletHeader() {
    const tonToUsd = parseFloat(this.walletData.balance) * parseFloat(this.walletData.balanceUSD) / 0.0073;

    return `
      <div class="wallet-header-section">
        <div class="wallet-address-display">
          <div>
            <div class="label-text">Wallet Address</div>
            <div class="address-value">${this.walletData.address}</div>
          </div>
          <button class="copy-btn" onclick="explorer.copyToClipboard('${this.walletData.address}', this)">📋</button>
        </div>

        <div class="wallet-stats">
          <div class="stat-card">
            <div class="stat-label">Balance</div>
            <div class="stat-value">
              ${this.walletData.balance} GRAM
              <span class="balance-usd">≈ $${tonToUsd.toFixed(3)}</span>
            </div>
            <div class="stat-secondary lock-icon">🔒 LOCKED IN WALLET NODES</div>
          </div>

          <div class="stat-card">
            <div class="stat-label">Contract Type</div>
            <div class="stat-value">${this.walletData.contractType}</div>
            <div class="status-badge">
              <span class="status-dot"></span>
              ${this.walletData.status}
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-label">Wallet Address (Short)</div>
            <div class="stat-value" style="font-size: 1.2rem;">${this.walletData.shortAddress}</div>
            <button class="icon-btn" style="margin-top: 0.5rem;" onclick="explorer.copyToClipboard('${this.walletData.address}', this)">📋 Copy</button>
          </div>
        </div>

        <div class="info-row">
          <div class="info-left">Official Website</div>
          <a href="https://toncoin.org" target="_blank" class="external-link">toncoin.org ↗</a>
        </div>
      </div>
    `;
  }

  renderTabs() {
    return `
      <div class="tabs-container">
        <div class="tabs-header">
          <button class="tab-button ${this.currentTab === 'history' ? 'active' : ''}" onclick="explorer.switchTab('history')">History</button>
          <button class="tab-button ${this.currentTab === 'raw' ? 'active' : ''}" onclick="explorer.switchTab('raw')">Raw Transactions</button>
          <button class="tab-button ${this.currentTab === 'code' ? 'active' : ''}" onclick="explorer.switchTab('code')">Code</button>
          <button class="tab-button ${this.currentTab === 'methods' ? 'active' : ''}" onclick="explorer.switchTab('methods')">Methods</button>
          <button class="tab-button ${this.currentTab === 'send' ? 'active' : ''}" onclick="explorer.switchTab('send')">Send Message</button>
        </div>

        <div class="tab-content ${this.currentTab === 'history' ? 'active' : ''}">
          ${this.renderHistoryTab()}
        </div>

        <div class="tab-content ${this.currentTab === 'raw' ? 'active' : ''}">
          ${this.renderRawTab()}
        </div>

        <div class="tab-content ${this.currentTab === 'code' ? 'active' : ''}">
          ${this.renderCodeTab()}
        </div>

        <div class="tab-content ${this.currentTab === 'methods' ? 'active' : ''}">
          ${this.renderMethodsTab()}
        </div>

        <div class="tab-content ${this.currentTab === 'send' ? 'active' : ''}">
          ${this.renderSendTab()}
        </div>
      </div>
    `;
  }

  renderHistoryTab() {
    if (this.walletData.transactions.length === 0) {
      return '<div class="empty-state"><div class="empty-state-icon">📭</div><p>No transactions found</p></div>';
    }

    const rows = this.walletData.transactions.map(tx => `
      <tr>
        <td>${tx.type === 'in' ? '📥 IN' : '📤 OUT'}</td>
        <td class="tx-hash">${tx.hash.substring(0, 16)}...</td>
        <td><span class="tx-amount-${tx.type}">${tx.type === 'in' ? '+' : '-'}${tx.amount} TON</span></td>
        <td>${tx.from || tx.to || 'N/A'}</td>
        <td>${this.formatTime(tx.timestamp)}</td>
        <td><span class="tx-status confirmed">✓ Confirmed</span></td>
      </tr>
    `).join('');

    return `
      <table class="transactions-table">
        <thead>
          <tr>
            <th>Type</th>
            <th>Hash</th>
            <th>Amount</th>
            <th>Address</th>
            <th>Time</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          ${rows}
        </tbody>
      </table>
    `;
  }

  renderRawTab() {
    return `
      <div>
        <div class="code-block-title">Raw Transaction Data (JSON)</div>
        <div class="code-block">${this.escapeHtml(JSON.stringify(this.walletData.transactions, null, 2))}</div>
      </div>
    `;
  }

  renderCodeTab() {
    const contractCode = `
#include "stdlib.fc";

() recv_internal(int my_balance, int msg_value, cell in_msg_full, slice in_msg_body) impure inline {
    if (in_msg_body.slice_empty?()) {
        return ();
    }
    
    int op = in_msg_body~load_uint(32);
    int query_id = in_msg_body~load_uint(64);
    
    if (op == 0x5F04B8F5) {
        ;; seqno & subwallet_id from get_data
        return ();
    }
}

int get_seqno() method_id {
    return get_data().begin_parse().preload_uint(32);
}
    `.trim();

    return `
      <div>
        <div class="code-block-title">Wallet Smart Contract Code (FunC)</div>
        <div class="code-block">${this.escapeHtml(contractCode)}</div>
        <p style="margin-top: 1rem; color: var(--text-secondary); font-size: 0.9rem;">
          This is the smart contract code compiled to TON Virtual Machine bytecode.
        </p>
      </div>
    `;
  }

  renderMethodsTab() {
    return `
      <div style="max-width: 100%; overflow-x: auto;">
        <table class="transactions-table">
          <thead>
            <tr>
              <th>Method Name</th>
              <th>Description</th>
              <th>Parameters</th>
              <th>Return Type</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><code>get_seqno</code></td>
              <td>Get the current sequence number</td>
              <td>None</td>
              <td>int</td>
            </tr>
            <tr>
              <td><code>get_subwallet_id</code></td>
              <td>Get the subwallet identifier</td>
              <td>None</td>
              <td>int</td>
            </tr>
            <tr>
              <td><code>get_public_key</code></td>
              <td>Get the wallet public key</td>
              <td>None</td>
              <td>int</td>
            </tr>
            <tr>
              <td><code>recv_internal</code></td>
              <td>Handle internal messages</td>
              <td>int, int, cell, slice</td>
              <td>void</td>
            </tr>
            <tr>
              <td><code>recv_external</code></td>
              <td>Handle external messages</td>
              <td>slice</td>
              <td>void</td>
            </tr>
          </tbody>
        </table>
      </div>
    `;
  }

  renderSendTab() {
    return `
      <div style="max-width: 600px;">
        <form id="send-form">
          <div class="form-group">
            <label class="form-label">Recipient Address</label>
            <input type="text" class="form-input" placeholder="Enter recipient wallet address" required>
          </div>
          <div class="form-group">
            <label class="form-label">Amount (TON)</label>
            <input type="number" class="form-input" placeholder="Enter amount" step="0.001" required>
          </div>
          <div class="form-group">
            <label class="form-label">Message (Optional)</label>
            <textarea class="form-input" placeholder="Enter optional message" style="resize: vertical; min-height: 100px;"></textarea>
          </div>
          <div class="form-group">
            <label class="form-label">Fee</label>
            <input type="text" class="form-input" value="~0.001 TON" disabled>
          </div>
          <button type="submit" class="btn-primary" style="width: 100%;">Send Message</button>
        </form>
        <p style="margin-top: 1rem; color: var(--text-secondary); font-size: 0.9rem;">
          💡 Note: Ensure your wallet is connected and has sufficient balance to send messages.
        </p>
      </div>
    `;
  }

  renderFooter() {
    return `
      <footer class="footer">
        <div class="footer-container">
          <div class="footer-grid">
            <div class="footer-section">
              <h4>About</h4>
              <ul>
                <li><a href="#">About TON Explorer</a></li>
                <li><a href="#">How It Works</a></li>
                <li><a href="#">Documentation</a></li>
                <li><a href="#">Blog</a></li>
              </ul>
            </div>
            <div class="footer-section">
              <h4>Resources</h4>
              <ul>
                <li><a href="#">API Documentation</a></li>
                <li><a href="#">Smart Contracts</a></li>
                <li><a href="#">Developer Guide</a></li>
                <li><a href="#">RPC Endpoints</a></li>
              </ul>
            </div>
            <div class="footer-section">
              <h4>Community</h4>
              <ul>
                <li><a href="#">Discord</a></li>
                <li><a href="#">Telegram</a></li>
                <li><a href="#">Twitter</a></li>
                <li><a href="#">GitHub</a></li>
              </ul>
            </div>
            <div class="footer-section">
              <h4>Legal</h4>
              <ul>
                <li><a href="#">Terms of Service</a></li>
                <li><a href="#">Privacy Policy</a></li>
                <li><a href="#">Cookie Policy</a></li>
                <li><a href="#">Contact Us</a></li>
              </ul>
            </div>
          </div>
          <div class="social-links">
            <a href="#" title="Telegram">📱</a>
            <a href="#" title="Twitter">𝕏</a>
            <a href="#" title="Discord">💬</a>
            <a href="#" title="GitHub">🐙</a>
          </div>
        </div>
        <div class="footer-bottom">
          <p>&copy; 2024 TON Wallet Explorer. All rights reserved.</p>
        </div>
      </footer>
    `;
  }

  switchTab(tabName) {
    this.currentTab = tabName;
    const tabs = document.querySelectorAll('.tab-button');
    const contents = document.querySelectorAll('.tab-content');
    
    tabs.forEach(tab => tab.classList.remove('active'));
    contents.forEach(content => content.classList.remove('active'));
    
    event.target.classList.add('active');
    document.querySelectorAll('.tab-content')[Array.from(tabs).indexOf(event.target)].classList.add('active');
  }

  copyToClipboard(text, button) {
    navigator.clipboard.writeText(text).then(() => {
      const originalText = button.textContent;
      button.textContent = '✓ Copied';
      button.classList.add('copied');
      setTimeout(() => {
        button.textContent = originalText;
        button.classList.remove('copied');
      }, 2000);
    });
  }

  formatTime(date) {
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  attachEventListeners() {
    const logoutBtn = document.getElementById('logout-btn');
    const settingsBtn = document.getElementById('settings-btn');
    const favoriteBtn = document.getElementById('favorite-btn');

    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => {
        this.currentPage = 'login';
        this.walletAddress = null;
        this.walletData = null;
        this.render();
      });
    }

    if (settingsBtn) {
      settingsBtn.addEventListener('click', () => {
        alert('Settings feature coming soon!');
      });
    }

    if (favoriteBtn) {
      favoriteBtn.addEventListener('click', () => {
        favoriteBtn.textContent = favoriteBtn.textContent === '⭐' ? '★' : '⭐';
      });
    }
  }
}

const explorer = new TonWalletExplorer();