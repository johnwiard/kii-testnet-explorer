const RPC_URL = "https://rpc.testnet.ki.chain.io/status";

fetch(RPC_URL)
  .then(res => res.json())
  .then(data => {
    const height = data.result.sync_info.latest_block_height;
    const time = data.result.sync_info.latest_block_time;
    document.getElementById("block-height").innerText = height;
    document.getElementById("block-time").innerText = new Date(time).toLocaleString();
  })
  .catch(err => {
    document.getElementById("block-height").innerText = "Error";
    document.getElementById("block-time").innerText = "Error";
    console.error("Failed to fetch RPC:", err);
  });
