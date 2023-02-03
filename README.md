1. Installation & Runing
  - Installation
    ○ Installation node.js on your computer
    ○ Opening command prompt in Bot folder
    ○ run "npm install --global yarn" command in Terminal
    ○ run "yarn install" command in Terminal
  - Running
    ○ Running Bot: run "npx hardhat run --network bsc .\scripts\trade.js" command in terminal window.
    ○ Stopping Bot: Ctrl + C

2.	How DEX Arbitrage Works

This is buying a digital asset on one decentralized exchange and selling it on another. For this we will need a smart contract and a controller to execute the transactions.
DEX arbitrage slide
The general idea is to take advantage of mispricing between exchanges. When someone executes a large trade in to one liquidity pool it can create an inbalance distorting the price and causing slippage for that trader. Arbitrage bots will then work to restore the balance by taking liquidity from other markets.
We will use a solidity smart contract as a relay between our controller and the exchanges. This is useful as it allows for fast execution of complex queries and batching multiple swaps into a single transaction. Critically we can revert the entire transaction and only lose the transaction fee if it is not profitable with one line of code.


3.	DEX Arbitrage Smart Contract

I will be using the Uniswap v2 router which has been forked multiple times on just about every blockchain in existence.

Checking Prices & Trade Profitability
The code is setup to query the router for a minimum quantity out given a specific input.
function getAmountOutMin(address router, address _tokenIn, address _tokenOut, uint256 _amount) public view returns (uint256) {
  address[] memory path;
  path = new address[](2);
  path[0] = _tokenIn;
  path[1] = _tokenOut;
  uint256[] memory amountOutMins = IUniswapV2Router(router).getAmountsOut(_amount, path);
  return amountOutMins[path.length -1];
}

From there it’s possible to query multiple dexes in a single query with something like this:
function estimateDualDexTrade(address _router1, address _router2, address _token1, address _token2, uint256 _amount) external view returns (uint256) {
  uint256 amtBack1 = getAmountOutMin(_router1, _token1, _token2, _amount);
  uint256 amtBack2 = getAmountOutMin(_router2, _token2, _token1, amtBack1);
  return amtBack2;
}
The function above takes two router addresses for two different DEX’s and two tokens. It checks whether it would be profitable to swap token1 for token2 on router1 and then swap it back on router2.


4.	Executing Batched Trades

Trades need to be batched together to make sure they are profitable before we let them go through. This means combining two swaps on two different exchanges into a single transaction.
function dualDexTrade(address _router1, address _router2, address _token1, address _token2, uint256 _amount) external onlyOwner {
  uint startBalance = IERC20(_token1).balanceOf(address(this));
  uint token2InitialBalance = IERC20(_token2).balanceOf(address(this));
  swap(_router1,_token1, _token2,_amount);
  uint token2Balance = IERC20(_token2).balanceOf(address(this));
  uint tradeableAmount = token2Balance - token2InitialBalance;
  swap(_router2,_token2, _token1,tradeableAmount);
  uint endBalance = IERC20(_token1).balanceOf(address(this));
  require(endBalance > startBalance, "Trade Reverted, No Profit Made");
}
The function checks balances then carries out two swaps before checking that the final balance is greater than what we started with. If no profit is made the whole transaction gets rolled back to the original state.
Finally we need a way to withdraw ERC20 funds from the contract.
function recoverTokens(address tokenAddress) external onlyOwner {
  IERC20 token = IERC20(tokenAddress);
  token.transfer(msg.sender, token.balanceOf(address(this)));
}


5.	Creating A Trading Bot Controller

npm install
Then put a private key in the .env file.
Next deploy the smart contract.
npx hardhat run --network BSC .\scripts\deploy.js
Add the deployed contract address to .env

Once the contract was deployed I purchased a number of different base assets to use as collateral. The more base assets the more opportunities there are to trade different markets.
There are 3 scripts in the directory for checking contract balances, sending funds and recovering funds easily so you don’t need to do it manually for each asset. If you are going to try setting this up it would pay to try it first with a tiny amount of assets and make sure you can recover the funds correctly from the contract when you are done.
The next step is to create a trading bot controller which fires routes and token addresses at the smart contract to find out if there are any opportunities for trades and then executes those trades.

First step is to create an instance of our contract.
[owner] = await ethers.getSigners();
const IArb = await ethers.getContractFactory('Arb');
arb = await IArb.attach(arbContract);

We then cycle through our routes to look for trades using the checkDualDexTrade function in our smart contract.
const amtBack = await arb.estimateDualDexTrade(targetRoute.router1, targetRoute.router2, targetRoute.token1, targetRoute.token2, tradeSize);
const multiplier = ethers.BigNumber.from(config.minBasisPointsPerTrade+10000);
const sizeMultiplied = tradeSize.mul(multiplier);
const divider = ethers.BigNumber.from(10000);
const profitTarget = sizeMultiplied.div(divider);
if (amtBack.gt(profitTarget)) {
  await dualTrade(targetRoute.router1,targetRoute.router2,targetRoute.token1,targetRoute.token2,tradeSize);
} else {
  await lookForDualTrade();
}

Once we have found a trade which is profitable we execute it using the dualDexTrade function.
const tx = await arb.connect(owner).dualDexTrade(router1, router2, baseToken, token2, amount);
await tx.wait();
Note that there is some logic to handle too many trades at any one time. I found that executing too quickly didn’t give the RPC nodes a chance to catch up which gave duplicate nonce errors. There is a hardhat module called NonceManager but I couldn’t get it to work consistently.