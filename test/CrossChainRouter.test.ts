import { expect } from "chai";
import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";
import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { Contract, parseEther } from "ethers";

// Test token deployment helper
async function deployTestToken() {
  const TestToken = await ethers.getContractFactory("TestToken");
  const token = await TestToken.deploy("Test Token", "TST", 18);
  await token.waitForDeployment();
  return token;
}

describe("CrossChainRouter", function () {
  let owner: SignerWithAddress;
  let user: SignerWithAddress;
  let router: Contract;
  let mockAdapter: Contract;
  let testToken: Contract;
  
  // Test constants
  const DESTINATION_CHAIN_ID = 43113; // Avalanche Fuji
  const TEST_AMOUNT = parseEther("1.0");
  
  async function deployFixture() {
    // Deploy TestToken
    const TestToken = await ethers.getContractFactory("TestToken");
    const testToken = await TestToken.deploy("Test Token", "TST", 18);
    await testToken.waitForDeployment();
    
    // Deploy MockBridgeAdapter
    const MockBridgeAdapter = await ethers.getContractFactory("MockBridgeAdapter");
    const mockAdapter = await MockBridgeAdapter.deploy();
    await mockAdapter.waitForDeployment();
    
    // Deploy CrossChainRouter
    const CrossChainRouter = await ethers.getContractFactory("CrossChainRouter");
    const router = await CrossChainRouter.deploy();
    await router.waitForDeployment();
    
    return { testToken, mockAdapter, router };
  }
  
  beforeEach(async function () {
    [owner, user] = await ethers.getSigners();
    const fixture = await loadFixture(deployFixture);
    testToken = fixture.testToken;
    mockAdapter = fixture.mockAdapter;
    router = fixture.router;
    
    // Add mock adapter to the router for native token
    await router.addBridgeAdapter(await mockAdapter.getAddress(), ethers.ZeroAddress);
  });
  
  it("should add and remove bridge adapters", async function () {
    const adapterAddress = await mockAdapter.getAddress();
    
    // Test adding a bridge adapter
    expect(await router.isBridgeAdapter(adapterAddress)).to.be.true;
    
    // Check token-to-adapter mapping
    const adapters = await router.tokenToBridgeAdapters(ethers.ZeroAddress);
    expect(adapters).to.include(adapterAddress);
    
    // Test removing a bridge adapter
    await router.removeBridgeAdapter(adapterAddress);
    expect(await router.isBridgeAdapter(adapterAddress)).to.be.false;
    
    // Add it back for further tests
    await router.addBridgeAdapter(adapterAddress, ethers.ZeroAddress);
  });
  
  it("should add bridge adapter for ERC20 token", async function () {
    const adapterAddress = await mockAdapter.getAddress();
    const tokenAddress = await testToken.getAddress();
    
    // Add adapter for ERC20 token
    await router.addBridgeAdapter(adapterAddress, tokenAddress);
    
    // Check token-to-adapter mapping
    const adapters = await router.tokenToBridgeAdapters(tokenAddress);
    expect(adapters).to.include(adapterAddress);
  });
  
  it("should find the best route", async function () {
    const [adapter, fee] = await router.findBestRoute(
      ethers.ZeroAddress, // Native token
      TEST_AMOUNT,
      DESTINATION_CHAIN_ID
    );
    
    expect(adapter).to.equal(await mockAdapter.getAddress());
    expect(fee).to.be.gt(0);
  });
  
  it("should route native tokens through the bridge", async function () {
    const recipient = user.address;
    const adapterAddress = await mockAdapter.getAddress();
    
    // Create a route for native token (ETH)
    const route = {
      bridgeAdapter: adapterAddress,
      token: ethers.ZeroAddress, // Native token
      amount: TEST_AMOUNT,
      destinationChainId: DESTINATION_CHAIN_ID,
      data: "0x"
    };
    
    // Send the transaction with value for native token transfer
    const tx = router.routeAssets(
      [route],
      recipient,
      { value: TEST_AMOUNT }
    );
    
    // Check that the event was emitted with correct parameters
    await expect(tx)
      .to.emit(mockAdapter, "MockBridged")
      .withArgs(
        ethers.ZeroAddress,
        TEST_AMOUNT,
        DESTINATION_CHAIN_ID,
        recipient,
        anyValue
      );
    
    // Check that the AssetRouted event was emitted
    await expect(tx)
      .to.emit(router, "AssetRouted")
      .withArgs(
        ethers.ZeroAddress,
        TEST_AMOUNT,
        DESTINATION_CHAIN_ID,
        recipient,
        adapterAddress,
        anyValue
      );
  });
  
  it("should route ERC20 tokens through the bridge", async function () {
    const recipient = user.address;
    const adapterAddress = await mockAdapter.getAddress();
    const tokenAddress = await testToken.getAddress();
    
    // Add adapter for ERC20 token
    await router.addBridgeAdapter(adapterAddress, tokenAddress);
    
    // Mint tokens to the user
    await testToken.mint(owner.address, TEST_AMOUNT);
    await testToken.approve(router.getAddress(), TEST_AMOUNT);
    
    // Create a route for ERC20 token
    const route = {
      bridgeAdapter: adapterAddress,
      token: tokenAddress,
      amount: TEST_AMOUNT,
      destinationChainId: DESTINATION_CHAIN_ID,
      data: "0x"
    };
    
    // Send the transaction with ERC20 token transfer
    const tx = router.routeAssets(
      [route],
      recipient
    );
    
    // Check that the event was emitted with correct parameters
    await expect(tx)
      .to.emit(mockAdapter, "MockBridged")
      .withArgs(
        tokenAddress,
        TEST_AMOUNT,
        DESTINATION_CHAIN_ID,
        recipient,
        anyValue
      );
  });
  
  it("should handle multiple routes with native token", async function () {
    const recipient = user.address;
    const adapterAddress = await mockAdapter.getAddress();
    const halfAmount = TEST_AMOUNT / 2n;
    
    // Create two routes splitting the amount
    const routes = [
      {
        bridgeAdapter: adapterAddress,
        token: ethers.ZeroAddress,
        amount: halfAmount,
        destinationChainId: DESTINATION_CHAIN_ID,
        data: "0x"
      },
      {
        bridgeAdapter: adapterAddress,
        token: ethers.ZeroAddress,
        amount: halfAmount,
        destinationChainId: DESTINATION_CHAIN_ID,
        data: "0x"
      }
    ];
    
    // Send the transaction with value for native token transfer
    const tx = router.routeAssets(
      routes,
      recipient,
      { value: TEST_AMOUNT }
    );
    
    // Should emit two events
    await expect(tx).to.emit(mockAdapter, "MockBridged").twice();
    await expect(tx).to.emit(router, "AssetRouted").twice();
  });
  
  it("should refund excess native token", async function () {
    const recipient = user.address;
    const adapterAddress = await mockAdapter.getAddress();
    const excessAmount = parseEther("0.5");
    
    // Create a route with less value than sent
    const route = {
      bridgeAdapter: adapterAddress,
      token: ethers.ZeroAddress,
      amount: TEST_AMOUNT,
      destinationChainId: DESTINATION_CHAIN_ID,
      data: "0x"
    };
    
    // Send more value than needed
    const userBalanceBefore = await ethers.provider.getBalance(owner.address);
    const tx = await router.routeAssets(
      [route],
      recipient,
      { value: TEST_AMOUNT + excessAmount }
    );
    
    // Get the gas used for the transaction
    const receipt = await tx.wait();
    const gasUsed = receipt.gasUsed * receipt.gasPrice;
    
    // Check that the excess was refunded
    const userBalanceAfter = await ethers.provider.getBalance(owner.address);
    const expectedBalance = userBalanceBefore - TEST_AMOUNT - gasUsed;
    expect(userBalanceAfter).to.be.closeTo(expectedBalance, parseEther("0.01"));
  });
  
  it("should revert if insufficient native token value", async function () {
    const recipient = user.address;
    const adapterAddress = await mockAdapter.getAddress();
    
    // Create a route that requires more value than sent
    const route = {
      bridgeAdapter: adapterAddress,
      token: ethers.ZeroAddress,
      amount: TEST_AMOUNT,
      destinationChainId: DESTINATION_CHAIN_ID,
      data: "0x"
    };
    
    // Send less value than needed
    await expect(
      router.routeAssets(
        [route],
        recipient,
        { value: TEST_AMOUNT / 2n }
      )
    ).to.be.revertedWith("Insufficient native token value");
  });
  
  // Helper function to match any value in events
  function anyValue() {
    return true;
  }
});
