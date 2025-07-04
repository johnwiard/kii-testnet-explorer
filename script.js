const LCD = "https://lcd.uno.sentry.testnet.v3.kiivalidator.com";

function navigate(page) {
  history.pushState({page}, "", `#${page}`);
  loadPage(page);
}
window.onpopstate = () => loadPage(location.hash.slice(1)||"dashboard");

async function loadPage(page) {
  const c = document.getElementById("content");
  c.innerHTML = `<h2>${page}</h2><p>Loading...</p>`;
  try {
    switch(page) {
      case 'dashboard': return loadDashboard();
      case 'governance': return loadGov();
      case 'staking': return loadStaking();
      case 'blocks': return loadBlocks();
      case 'transactions': return loadTxs();
      case 'uptime': return loadUptime();
      case 'ibc': return loadIBC();
      case 'consensus': return loadConsensus();
      case 'parameters': return loadParams();
      default: return loadDashboard();
    }
  } catch(e) { c.innerHTML = `<p>Error: ${e.message}</p>`; }
}

async function loadDashboard() {
  const [blk,sup] = await Promise.all([
    fetch(`${LCD}/blocks/latest`).then(r=>r.json()),
    fetch(`${LCD}/cosmos/bank/v1beta1/supply`).then(r=>r.json())
  ]);
  const height = blk.block.header.height;
  const supply = sup.supply.map(s=>parseInt(s.amount)/1e6);
  document.getElementById("content").innerHTML = `
    <h2>Dashboard</h2>
    <p>Latest Height: ${height}</p>
    <canvas id="supplyChart"></canvas>`;
  new Chart(document.getElementById("supplyChart"), {
    type:'pie', data:{
      labels:sup.supply.map(s=>s.denom),
      datasets:[{data:supply, backgroundColor:['#3498db','#2ecc71','#e74c3c']}]
    }
  });
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
    <h2>Staking</h2>
    <table><tr><th>Moniker</th><th>Status</th><th>Tokens</th></tr>
    ${st.validators.map(v=>`<tr><td>${v.description.moniker}</td><td>${v.status}</td><td>${(v.tokens/1e6).toFixed(2)}</td></tr>`).join('')}
    </table>`;
}

async function loadBlocks() {
  const blk = await fetch(`${LCD}/cosmos/base/tendermint/v1beta1/blocks/latest`).then(r=>r.json());
  document.getElementById("content").innerHTML = `
    <h2>Blocks</h2>
    <p>Height: ${blk.block?.header.height}<br>Time: ${blk.block?.header.time}</p>`;
}

async function loadTxs() {
  const txs = await fetch(`${LCD}/cosmos/tx/v1beta1/txs?limit=10`).then(r=>r.json());
  document.getElementById("content").innerHTML = `
    <h2>Transactions</h2>
    <table><tr><th>Hash</th><th>Height</th></tr>
    ${txs.tx_responses.map(t=>`<tr><td>${t.txhash}</td><td>${t.height}</td></tr>`).join('')}
    </table>`;
}

async function loadUptime() {
  const st = await fetch(`${LCD}/cosmos/staking/v1beta1/validators`).then(r=>r.json());
  document.getElementById("content").innerHTML = `
    <h2>Uptime</h2>
    <table><tr><th>Moniker</th><th>Jailed</th></tr>
    ${st.validators.map(v=>`<tr><td>${v.description.moniker}</td><td>${v.jailed?'❌':'✅'}</td></tr>`).join('')}
    </table>`;
}

async function loadIBC() {
  const ibc = await fetch(`${LCD}/ibc/core/channel/v1/channels`).then(r=>r.json());
  document.getElementById("content").innerHTML = `
    <h2>IBC Channels</h2>
    <table><tr><th>ID</th><th>State</th><th>Counterparty</th></tr>
    ${ibc.channels.map(c=>`<tr><td>${c.channel_id}</td><td>${c.state}</td><td>${c.counterparty.channel_id}</td></tr>`).join('')}
    </table>`;
}

async function loadConsensus() {
  const cs = await fetch(`${LCD}/cosmos/consensus/v1/params`).then(r=>r.json());
  const p = cs.params;
  document.getElementById("content").innerHTML = `
    <h2>Consensus Params</h2>
    <pre>${JSON.stringify(p,null,2)}</pre>`;
}

async function loadParams() {
  const resp = await fetch(`${LCD}/cosmos/consensus/v1/params`).then(r=>r.json());
  document.getElementById("content").innerHTML = `
    <h2>Chain Parameters</h2>
    <pre>${JSON.stringify(resp,null,2)}</pre>`;
}

// Load initial page
loadPage(location.hash.slice(1)||"dashboard");
