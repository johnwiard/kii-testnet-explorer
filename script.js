const LCD = "https://lcd.uno.sentry.testnet.v3.kiivalidator.com";

async function loadPage(page) {
  const c = document.getElementById("content");
  c.innerHTML = `<h2>${page}</h2><p>Loading…</p>`;
  try {
    switch(page) {
      case 'dashboard': return loadDashboard();
      case 'governance': return loadGov();
      case 'staking': return loadStaking();
      case 'blocks': return loadBlocks();
      case 'transactions': return loadTxs();
      case 'uptime': return loadUptime();
    }
  } catch(err) { c.innerHTML = `<p>Error: ${err}</p>`; }
}

async function loadDashboard() {
  const [blk, sup] = await Promise.all([
    fetch(`${LCD}/blocks/latest`).then(r=>r.json()),
    fetch(`${LCD}/cosmos/bank/v1beta1/supply`).then(r=>r.json())
  ]);
  document.getElementById("content").innerHTML = `
    <h2>Dashboard</h2>
    <p>Chain ID: ${blk.block.header.chain_id}</p>
    <p>Latest Height: ${blk.block.header.height}</p>
    <p>Total Supply: ${sup.supply.map(s=>s.amount+' '+s.denom).join(', ')}</p>`;
}

async function loadGov() {
  const gov = await fetch(`${LCD}/cosmos/gov/v1beta1/proposals`).then(r=>r.json());
  document.getElementById("content").innerHTML = `
    <h2>Governance</h2>
    <table><tr><th>ID</th><th>Title</th><th>Status</th></tr>
    ${gov.proposals.map(p=>`<tr><td>${p.proposal_id}</td><td>${p.content.title}</td><td>${p.status}</td></tr>`).join('')}
    </table>`;
}

async function loadStaking() {
  const st = await fetch(`${LCD}/cosmos/staking/v1beta1/validators`).then(r=>r.json());
  document.getElementById("content").innerHTML = `
    <h2>Staking - Validators</h2>
    <table><tr><th>Moniker</th><th>Status</th><th>Tokens</th></tr>
    ${st.validators.map(v=>`<tr><td>${v.description.moniker}</td><td>${v.status}</td><td>${v.tokens}</td></tr>`).join('')}
    </table>`;
}

async function loadBlocks() {
  const blk = await fetch(`${LCD}/blocks/latest`).then(r=>r.json());
  document.getElementById("content").innerHTML = `
    <h2>Blocks</h2>
    <p>Height: ${blk.block.header.height}<br>Time: ${blk.block.header.time}</p>`;
}

async function loadTxs() {
  const txs = await fetch(`${LCD}/cosmos/tx/v1beta1/txs?limit=10`).then(r=>r.json());
  document.getElementById("content").innerHTML = `
    <h2>Transactions (latest 10)</h2>
    <table><tr><th>Hash</th><th>Height</th></tr>
    ${txs.tx_responses.map(t=>`<tr><td>${t.txhash}</td><td>${t.height}</td></tr>`).join('')}
    </table>`;
}

async function loadUptime() {
  const st = await fetch(`${LCD}/cosmos/staking/v1beta1/validators`).then(r=>r.json());
  document.getElementById("content").innerHTML = `
    <h2>Uptime</h2>
    <table><tr><th>Moniker</th><th>Uptime</th></tr>
    ${st.validators.map(v=>`<tr><td>${v.description.moniker}</td><td>${v.jailed?'❌':'✅'}</td></tr>`).join('')}
    </table>`;
}
