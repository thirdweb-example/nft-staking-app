# NFT Staking App

**Disclaimer**: This smart contract is not tested or audited by thirdweb. It is not intended for production use cases.

## Introduction

This example demonstrates a use of several thirdweb tools to create an NFT Staking application. In this example, users can stake their ERC721 NFTs and earn ERC20 tokens as a reward. It combines:

1. [thirdweb's NFT Drop Contract](https://portal.thirdweb.com/pre-built-contracts/nft-drop)
2. [thirdweb's Token Contract](https://portal.thirdweb.com/pre-built-contracts/token)
3. A modified version of this [NFT Staking Smart Contract](https://github.com/andreitoma8/ERC721-Staking) by [andreitoma8](https://github.com/andreitoma8/ERC721-Staking)

We deploy the NFT Staking Smart contract using [thirdweb deploy](https://portal.thirdweb.com/thirdweb-deploy) and interact with all three of the contracts using the thirdweb [TypeScript](https://portal.thirdweb.com/typescript) and [React](https://portal.thirdweb.com/react) SDKs.

**Check out the Demo here**: https://nft-staking-contract.thirdweb-example.com/

## Tools

- [**thirdweb Deploy**](https://portal.thirdweb.com/thirdweb-deploy): Deploy our `StakingContract.sol` smart contract with zero configuration by running `npx thirdweb deploy`.
- [**thirdweb React SDK**](https://docs.thirdweb.com/react): to enable users to connect and disconnect their wallets with our website, and interact with our smart contracts using hooks like [useNFTDrop](https://portal.thirdweb.com/react/react.usenftdrop), [useToken](https://portal.thirdweb.com/react/react.usetoken), and [useContract](https://portal.thirdweb.com/react/react.usecontract).

## Using This Repo

- Create a copy of this repo by running the below command:

```bash
npx thirdweb create --template nft-staking-app
```

- Deploy the `StakingContract.sol` smart contract by running the below command from the root of the project directory:

```bash
npx thirdweb deploy
```

- Configure the network you deployed in [`index.js`](./src/index.js):

```jsx
// This is the chainId your dApp will work on.
const activeChainId = ChainId.Mumbai;
```

- Run the project locally:

```bash
npm run dev
```

# Guide

In this section, we'll dive into the code and explain how it works.

## NFT Staking Smart Contract

The NFT Staking contract in [StakingContract.sol](./StakingContract.sol) can be broken down into three parts:

1. Staking
2. Withdrawing
3. Rewards

### Staking

NFTs can be staked by users to earn rewards, and are held by the smart contract until the user withdraws them.

We have two mappings to track which tokens are staked by which addresses and information about those addresses:

```solidity
    // Mapping of User Address to Staker info
    mapping(address => Staker) public stakers;

    // Mapping of Token Id to staker. Made for the SC to remeber
    // who to send back the ERC721 Token to.
    mapping(uint256 => address) public stakerAddress;
```

When the user calls the `stake` function on the smart contract, they smart contract transfers the NFT from their wallet to the contract:

```solidity
        // Transfer the token from the wallet to the Smart contract
        nftCollection.transferFrom(msg.sender, address(this), _tokenId);
```

The contract keeps track of the token's staked status and which address staked this token:

```solidity
        // Create StakedToken
        StakedToken memory stakedToken = StakedToken(msg.sender, _tokenId);

        // Add the token to the stakedTokens array
        stakers[msg.sender].stakedTokens.push(stakedToken);

        // Increment the amount staked for this wallet
        stakers[msg.sender].amountStaked++;

        // Update the mapping of the tokenId to the staker's address
        stakerAddress[_tokenId] = msg.sender;

        // Update the timeOfLastUpdate for the staker
        stakers[msg.sender].timeOfLastUpdate = block.timestamp;
```

We will talk about how the rewards system works and why we keep track of the `timeOfLastUpdate` and `amountStaked` in the **Rewards** section.

### Withdrawing

Withdrawing is essentially the opposite of staking.

We `transfer` the token back to the wallet address that staked it (that we store in the mapping).

```solidity
        // Wallet must own the token they are trying to withdraw
        require(stakerAddress[_tokenId] == msg.sender, "You don't own this token!");

        // Transfer the token back to the withdrawer
        nftCollection.transferFrom(address(this), msg.sender, _tokenId);
```

When the user withdraws the token, we mark the `.staker` of this token inside the user's `stakedTokens` array to be `address(0)` in order to keep track of which tokens are no longer staked, without having to remove anything from the array:

```solidity

        // Find the index of this token id in the stakedTokens array
        uint256 index = 0;
        for (uint256 i = 0; i < stakers[msg.sender].stakedTokens.length; i++) {
            if (
                stakers[msg.sender].stakedTokens[i].tokenId == _tokenId
                &&
                stakers[msg.sender].stakedTokens[i].staker != address(0)
            ) {
                index = i;
                break;
            }
        }

        // "Remove" this token from the stakedTokens array
        stakers[msg.sender].stakedTokens[index].staker = address(0);
```

### Rewards

Rewards are calculated based on

- How many NFTs the wallet has staked
- How much time has passed
- the `rewardsPerHour` rate configured in the contract.

In order to keep track of user's rewards and how they fluctuate over time, each staker has an `unclaimedRewards` field and a `timeOfLastUpdate` field.

Every time the user's rewards rate would change (e.g. they stake or withdraw an NFT), the `timeOfLastUpdate` and the `unclaimedRewards` fields are both updated.

For example, if a user staked 1 NFT for 1 hour, they would earn:

```
1 * 100,000 = 100,000
```

Then, if they staked another NFT after this hour, we somehow need to know how much they earnt up to this point, because their new rewards rate will increase after this new stake.

So, then it becomes:

```
1 * 100,000 * 1

+

2 * 100,000 * hours between this stake call and time now
```

This is how we keep track of the user's rewards despite fluctuating rewards rates as they stake and withdraw NFTs.

The calculate rewards function:

```solidity
    function calculateRewards(address _staker)
        internal
        view
        returns (uint256 _rewards)
    {
        return (((
            ((block.timestamp - stakers[_staker].timeOfLastUpdate) *
                stakers[_staker].amountStaked)
        ) * rewardsPerHour) / 3600);
    }
```

Calculate the total rewards owed to a user at the current point in time:

```solidity
    function availableRewards(address _staker) public view returns (uint256) {
        uint256 rewards = calculateRewards(_staker) +
            stakers[_staker].unclaimedRewards;
        return rewards;
    }
```

Update the information when the user `stake`s or `withdraw`s:

```solidity
        // Update the rewards for this user
        uint256 rewards = calculateRewards(msg.sender);
        stakers[msg.sender].unclaimedRewards += rewards;
```

Payout the user's rewards:

```solidity
    function claimRewards() external {
        uint256 rewards = calculateRewards(msg.sender) +
            stakers[msg.sender].unclaimedRewards;
        require(rewards > 0, "You have no rewards to claim");
        stakers[msg.sender].timeOfLastUpdate = block.timestamp;
        stakers[msg.sender].unclaimedRewards = 0;
        rewardsToken.safeTransfer(msg.sender, rewards);
    }
```

## Deploying the smart contract

We use [thirdweb deploy](https://portal.thirdweb.com/thirdweb-deploy) to deploy the Staking smart contract by running:

```bash
npx thirdweb deploy
```

This provides us with a link to deploy the contract via the [thirdweb dashboard](https://thirdweb.com/dashboard)

## Front-end Application

On the front-end, we connect to all three of our smart contracts and interact with them using thirdweb's SDKs.

### Configuring the ThirdwebProvider

We wrap our application in the `ThirdwebProvider` component to access all of the React SDK's hooks and configure the network we want to support.

```jsx
// This is the chainId your dApp will work on.
const activeChainId = ChainId.Mumbai;

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ThirdwebProvider desiredChainId={activeChainId}>
      <Component {...pageProps} />
    </ThirdwebProvider>
  );
}
```

### Mint Page

On the [mint.tsx](./pages/mint.tsx), we connect to our NFT Drop contract using the [useNFTDrop](https://portal.thirdweb.com/react/react.usenftdrop) hook.

```jsx
// Get the NFT Collection contract
const nftDropContract = useNFTDrop(
  "0x322067594DBCE69A9a9711BC393440aA5e3Aaca1" // your contract here
);
```

And allow user's to mint an NFT from our contract using the `claim` method:

```jsx
const tx = await nftDropContract?.claim(1); // 1 is quantity here
```

### Stake Page

The staking page connects to all three of our contracts:

1. NFTDrop contract using [useNFTDrop](https://portal.thirdweb.com/react/react.usenftdrop)

```jsx
const nftDropContract = useNFTDrop(nftDropContractAddress);
```

2. Token contract using [useToken](https://portal.thirdweb.com/react/react.usetoken)

```jsx
const tokenContract = useToken(tokenContractAddress);
```

3. Staking contract using [useContract](https://portal.thirdweb.com/react/react.usecontract)

```jsx
const { contract, isLoading } = useContract(stakingContractAddress);
```

**Loading Staked NFTs:**

```jsx
async function loadStakedNfts() {
  const stakedTokens = await contract?.call("getStakedTokens", address);

  // For each staked token, fetch it from the sdk
  const stakedNfts = await Promise.all(
    stakedTokens?.map(
      async (stakedToken: { staker: string, tokenId: BigNumber }) => {
        // Fetch metadata for each staked token id
        const nft = await nftDropContract?.get(stakedToken.tokenId);
        return nft;
      }
    )
  );

  // Store the result in state, now we have an array of NFT metadata.
  setStakedNfts(stakedNfts);
}
```

**Loading claimable rewards**:

```jsx
async function loadClaimableRewards() {
  const cr = await contract?.call("availableRewards", address);
}
```

**Staking NFTs**:

In order for the smart contract to have permission to transfer NFTs from our wallet, we need to ensure it has the required `approval`, which we do by calling the `setApprovalForAll` method for our NFTs in the NFT Drop contract.

```jsx
async function stakeNft(id: BigNumber) {
  if (!address) return;

  const isApproved = await nftDropContract?.isApproved(
    address,
    stakingContractAddress
  );
  // If not approved, request approval
  if (!isApproved) {
    await nftDropContract?.setApprovalForAll(stakingContractAddress, true);
  }
  const stake = await contract?.call("stake", id);
}
```

**Withdrawing NFTs**:

```jsx
async function withdraw(id: BigNumber) {
  const withdraw = await contract?.call("withdraw", id);
}
```

**Claiming Rewards**:

```jsx
async function claimRewards() {
  const claim = await contract?.call("claimRewards");
}
```

## Join our Discord!

For any questions, suggestions, join our discord at [https://discord.gg/thirdweb](https://discord.gg/thirdweb).
