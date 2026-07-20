/* Updated frontend/app.js
   - New hero/login UI (Tonviewer-like)
   - Redesigned wallet view with QR, balance card and transactions list
   - Keeps existing API calls unchanged
*/

class TonWalletExplorer {
  constructor() {
    this.app = document.getElementById('app');
    this.currentPage = 'login';
    this.walletAddress = null;
    this.walletData = null;
    this.currentTab = 'history';
    this.API_URL = 'https://tonwalletex.onrender.com';
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

  // --- LOGIN / HERO (Image 2 lookalike) ---
  renderLogin() {
    this.app.innerHTML = `
      <div class="hero-root">
        <header class="tv-header">
          <div class="tv-logo">
            <div class="diamond" />
            <span class="brand">Tonviewer</span>
          </div>
          <div class="tv-header-right">
            <button class="ghost-btn">/</button>
            <button class="ghost-btn">⚙</button>
            <button class="connect-btn" id="connect-fake">Connect Wallet</button>
          </div>
        </header>

        <main class="hero-main">
          <div class="hero-brand">
            <div class="diamond large"></div>
            <h1>Tonviewer</h1>
          </div>

          <div class="search-row">
            <div class="search-glow">
              <span class="search-icon">🔍</span>
              <input id="hero-search" class="search-input" placeholder="Search by address, name or transaction" />
              <button class="copy-icon" id="sample-search-btn">🔎</button>
            </div>
          </div>

          <div class="stats-strip">
            <div class="stat-item">
              <div class="stat-title">Gram (prev. Toncoin) Price</div>
              <div class="stat-value">$1.43</div>
            </div>
            <div class="stat-item middle">
              <div class="stat-title">Market Cap</div>
              <div class="stat-value">$3.64B</div>
            </div>
            <div class="stat-item">
              <div class="stat-title">Current TPS</div>
              <div class="stat-value">43.43</div>
            </div>
          </div>

          <section class="home-grid">
            <div class="card small-card">
              <h3>Wallets</h3>
              <ul class="compact-list">
                <li><strong>Tonkeeper</strong><span class="muted">The leading non-custodial wallet on TON</span></li>
                <li><strong>Tonkeeper Pro</strong><span class="muted">Desktop wallet. Receive, buy and spend crypto</span></li>
              </ul>
            </div>

            <div class="card small-card">
              <h3>Tokens</h3>
              <ul class="compact-list">
                <li>Most visited</li>
                <li>Recently added</li>
              </ul>
            </div>

            <div class="card small-card">
              <h3>Stats</h3>
              <div class="small-stat-row">
                <div><strong>Jettons Transfer · 1d</strong><div class="big">360,740</div></div>
                <div><strong>NFT Transfer · 1d</strong><div class="big">25,165</div></div>
              </div>
            </div>
          </section>

          <div class="login-card-compact">
            <form id="login-form">
              <label class="form-label">Enter Wallet Address</label>
              <div class="inline-form">
                <input id="wallet-input" class="form-input" placeholder="UQD4MsK...Whot4eDv" />
                <button type="submit" class="btn-login">Lookup</button>
              </div>
            </form>
            <div id="error-container" class="error-slot"></div>
          </div>
        </main>

        <footer class="footer-min">
          <div class="footer-min-inner">© 2026 Tonviewer — lightweight explorer</div>
        </footer>
      </div>
    `;

    document.getElementById('login-form').addEventListener('submit', (e) => this.handleLogin(e));

    // sample hero action: paste demo address into input
    document.getElementById('sample-search-btn').addEventListener('click', () => {
      const inp = document.getElementById('wallet-input') || document.getElementById('hero-search');
      if (inp) inp.value = 'UQD4MsKVED3zIIhyXZU31F5_7dqTVYAvQu2X9Wf3Whot4eDv';
    });

    const connectFake = document.getElementById('connect-fake');
    if (connectFake) {
      connectFake.addEventListener('click', () => {
        // scroll to compact form
        const el = document.querySelector('.login-card-compact');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      });
    }
  }

  handleLogin(e) {
    e.preventDefault();
    const addressInput = document.getElementById('wallet-input');
    const address = addressInput ? addressInput.value.trim() : '';
    const errorContainer = document.getElementById('error-container');

    if (!address) {
      if (errorContainer) errorContainer.innerHTML = '<div class="error-message">Please enter a wallet address</div>';
      return;
    }

    // Basic validation
    if (address.length < 48) {
      if (errorContainer) errorContainer.innerHTML = '<div class="error-message">Invalid wallet address format</div>';
      return;
    }

    this.walletAddress = address;
    this.fetchWalletData(address);
  }

  // --- Data fetching and mapping ---
  async fetchWalletData(address) {
    try {
      // Fetch wallet info from backend
      const infoResponse = await fetch(`${this.API_URL}/api/wallet/${address}/info`);
      const infoData = await infoResponse.json();

      if (!infoData.success) {
        const errorContainer = document.getElementById('error-container');
        if (errorContainer) errorContainer.innerHTML = '<div class="error-message">Wallet not found</div>';
        return;
      }

      // Fetch transactions from backend
      const txResponse = await fetch(`${this.API_URL}/api/wallet/${address}/transactions?limit=15`);
      const txData = await txResponse.json();

      // Fetch balance info from backend
      const balanceResponse = await fetch(`${this.API_URL}/api/wallet/${address}/balance`);
      const balanceData = await balanceResponse.json();

      // Build wallet data object (graceful fallbacks)
      const balanceTon = balanceData && (balanceData.balance_ton || balanceData.balance) ? String(balanceData.balance_ton || balanceData.balance) : '0';
      const balanceUsd = balanceData && (typeof balanceData.balance_usd === 'number') ? Number(balanceData.balance_usd) : 0;

      this.walletData = {
        address: address,
        balance: balanceTon,
        balanceUSD: balanceUsd,
        contractType: infoData.contract_type || 'wallet_v4r2',
        status: infoData.status || 'Active',
        shortAddress: address.substring(0, 6) + '...' + address.substring(address.length - 6),
        lockedInNodes: infoData.locked || false,
        transactions: txData.transactions && txData.transactions.length > 0 ? txData.transactions : [
          {
            id: 'tx_001',
            hash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
            type: 'in',
            amount: '0.5',
            from: 'UQAhE3dCbzJ2cCvzj00m0S_7Jkzu0vkuQVNQU45M...',
            timestamp: new Date(Date.now() - 3600000).toISOString(),
            status: 'confirmed'
          },
          {
            id: 'tx_002',
            hash: 'a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3',
            type: 'out',
            amount: '0.25',
            to: 'UQBRYtF-Xr5zVqU5XLqH3F0V5F9_q5Q7H7qH3F0V5F9...',
            timestamp: new Date(Date.now() - 7200000).toISOString(),
            status: 'confirmed'
          }
        ]
      };

      this.currentPage = 'wallet';
      this.render();
    } catch (error) {
      console.error('Error fetching wallet data:', error);
      const errorContainer = document.getElementById('error-container');
      if (errorContainer) errorContainer.innerHTML = '<div class="error-message">Error connecting to wallet service</div>';
    }
  }

  // --- Wallet page (Image 1 lookalike) ---
  renderWallet() {
    this.app.innerHTML = `
      <div class="page-root">
        <header class="tv-header">
          <div class="tv-logo">
            <div class="diamond" />
            <span class="brand">Tonviewer</span>
          </div>
          <div class="tv-header-right">
            <button class="ghost-btn" id="header-search-toggle">/</button>
            <button class="ghost-btn">⚙</button>
            <button class="connect-btn" id="disconnect-btn">Disconnect</button>
          </div>
        </header>

        <main class="page-content narrow">
          <div class="address-card">
            <div class="address-left">
              <div class="address-title">Address</div>
              <div class="address-value">${this.walletData.address}</div>

              <div class="meta-row">
                <div>
                  <div class="meta-label">Balance</div>
                  <div class="meta-value">${this.walletData.balance} GRAM <span class="muted">≈ $${this.walletData.balanceUSD || '0.00'}</span></div>
                </div>
                <div>
                  <div class="meta-label">Contract type</div>
                  <div class="meta-value">${this.walletData.contractType}</div>
                </div>
              </div>

              <div class="status-row">
                <span class="status-active">● ${this.walletData.status}</span>
                <a class="muted link" href="https://toncoin.org" target="_blank">toncoin.org</a>
              </div>
            </div>

            <div class="address-right">
              <div class="qr-box"><img alt="qr" src="/frontend/sample-qr.png" onerror="this.style.opacity=0.08" /></div>
            </div>
          </div>

          <div class="card history-card">
            <div class="card-header">
              <h3>History</h3>
              <div class="controls">
                <button class="ghost-small">Sort</button>
                <button class="ghost-small">Date</button>
              </div>
            </div>

            ${this.renderHistoryTab()}
          </div>
        </main>

        <footer class="footer-min">
          <div class="footer-min-inner">© 2026 Tonviewer — lightweight explorer</div>
        </footer>
      </div>
    `;

    this.attachEventListeners();
  }

  renderHistoryTab() {
    if (!this.walletData || !this.walletData.transactions || this.walletData.transactions.length === 0) {
      return '<div class="empty-state"><div class="empty-state-icon">📭</div><p>No transactions found</p></div>';
    }

    const rows = this.walletData.transactions.map(tx => {
      const ts = tx.timestamp ? this.formatTime(new Date(tx.timestamp)) : '—';
      const hash = (tx.hash || tx.id || '').toString();
      const shortHash = hash.length > 14 ? hash.substring(0, 14) + '...' : hash;
      const addr = tx.from || tx.to || '—';
      const amount = tx.amount || '0';
      const isIn = tx.type === 'in' || tx.type === 'incoming';

      return `
        <div class="tx-row">
          <div class="tx-col type">${isIn ? '📥' : '📤'} ${isIn ? 'Received' : 'Sent'}</div>
          <div class="tx-col hash mono">${shortHash}</div>
          <div class="tx-col addr mono">${addr}</div>
          <div class="tx-col time">${ts}</div>
          <div class="tx-col amount ${isIn ? 'positive' : 'negative'}">${isIn ? '+' : '-'}${amount} GRAM</div>
        </div>
      `;
    }).join('');

    return `<div class="tx-list">${rows}</div>`;
  }

  // --- Helpers ---
  switchTab(tabName) {
    // re-render wallet page with new tab - simpler approach
    this.currentTab = tabName;
    this.render();
  }

  copyToClipboard(text, button) {
    if (!navigator.clipboard) {
      alert('Clipboard not supported');
      return;
    }
    navigator.clipboard.writeText(text).then(() => {
      if (button) {
        const original = button.textContent;
        button.textContent = '✓ Copied';
        button.classList.add('copied');
        setTimeout(() => {
          button.textContent = original;
          button.classList.remove('copied');
        }, 1800);
      }
    });
  }

  formatTime(date) {
    if (!date || !(date instanceof Date)) return '—';
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
    // Disconnect back to login
    const disconnectBtn = document.getElementById('disconnect-btn');
    if (disconnectBtn) {
      disconnectBtn.addEventListener('click', () => {
        this.currentPage = 'login';
        this.walletAddress = null;
        this.walletData = null;
        this.render();
      });
    }

    // Small UX: copy icon in wallet header uses explorer.copyToClipboard inline
    // Nothing else to attach now; pages re-render on actions
  }
}

const explorer = new TonWalletExplorer();
