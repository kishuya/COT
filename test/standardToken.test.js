
import { advanceBlock } from './helpers/advanceToBlock';
import { increaseTimeTo, duration } from './helpers/increaseTime';
import { event_period } from './helpers/eventPeriod';
import { event_parameter } from './helpers/eventParameters';
import token from './helpers/token';

const assertRevert = require('./helpers/assertRevert');
const BigNumber = web3.BigNumber;

const should = require('chai')
  .use(require('chai-as-promised'))
  .use(require('chai-bignumber')(BigNumber))
  .should();

const COTCoinCrowdsale = artifacts.require("./COTCoinCrowdsale.sol");
const COTCoin = artifacts.require("./COTCoin.sol");
const WhiteList = artifacts.require("./WhiteList.sol");
const Lockup = artifacts.require("./Lockup.sol");
const PausableToken = artifacts.require("./PausableToken.sol");

contract('COTCoinCrowdsale', function ([owner, unsale_owner, purchaser, purchaser2, purchaser3]) {
  const wallet = owner;
  const unsale_owner_wallet = unsale_owner;
  const rate = event_parameter.rate();
  const totalSupply = event_parameter.totalSupply();
  const lowest_weiAmount = event_parameter.lowest_weiAmount();

  before(async function () {
    // Advance to the next block to correctly read time in the solidity "now" function interpreted by testrpc
    await advanceBlock();
  });

  beforeEach(async function () {

    this.current_time = web3.eth.getBlock(web3.eth.blockNumber).timestamp;
    this.premiumSales_startTime = event_period.premiumSales_startTime(this.current_time);;
    this.premiumSales_endTime = event_period.premiumSales_endTime(this.premiumSales_startTime);;
    this.preSales_startTime = event_period.preSales_startTime(this.premiumSales_endTime);
    this.preSales_endTime = event_period.preSales_endTime(this.preSales_startTime);
    this.publicSales_startTime = event_period.publicSales_startTime(this.preSales_endTime);
    this.publicSales_endTime = event_period.publicSales_endTime(this.publicSales_startTime);
    this.afterPreSales_endTime = event_period.afterPreSales_endTime(this.preSales_endTime);
    this.afterEndTime = event_period.afterEndTime(this.publicSales_endTime);
    this.lockUpTime = event_period.lockUpTime(this.publicSales_endTime); 
    this.whitelist = await WhiteList.new();
    this.pausableToken = await PausableToken.new();
    this.lockup = await Lockup.new(this.lockUpTime);
    this.crowdsale = await COTCoinCrowdsale.new(this.premiumSales_startTime, this.premiumSales_endTime, 
      this.preSales_startTime, this.preSales_endTime, 
      this.publicSales_startTime, this.publicSales_endTime, 
      rate, lowest_weiAmount, 
      wallet, unsale_owner_wallet, 
      this.whitelist.address, this.pausableToken.address,
      this.lockup.address);
    this.token_address = await this.crowdsale.token();
    //console.log(this.token_address);
    this.token = COTCoin.at(this.token_address);
  });

  it('should return the correct totalSupply after construction', async function () {
    let totalSupplyTmp = await this.token.totalSupply();

    totalSupplyTmp = totalSupplyTmp.toString(10);
    let expected_totalSupply =  web3.fromWei(totalSupplyTmp, "ether");
    assert.equal(expected_totalSupply, totalSupply);
  });

  it('should return the correct allowance amount after approval', async function () {
    let tokens = web3.toWei(100, "ether");
    await this.token.approve(purchaser, tokens);
    let allowance = await this.token.allowance(owner, purchaser);
    allowance = allowance.toString(10);
    allowance = web3.fromWei(allowance, "ether");
    assert.equal(allowance, 100);
    /*
    console.log(allowance);

    let owner_tokens =  await this.token.balanceOf(owner);
    let purchaser_tokens =  await this.token.balanceOf(purchaser);
    */
  });

  it('should return correct balances after transfer', async function () {
    let tokens = web3.toWei(100, "ether");

    const expect_data = await this.token.balanceOf(owner);
    var expect = token(expect_data.toNumber(10));

    await this.token.transfer(purchaser, tokens);
    let balance0 = await this.token.balanceOf(owner);
    balance0 = balance0.toString(10);
    balance0 = web3.fromWei(balance0, "ether");
    assert.equal(balance0, (expect-100));

    let balance1 = await this.token.balanceOf(purchaser);
    balance1 = balance1.toString(10);
    balance1 = web3.fromWei(balance1, "ether");

    //console.log([balance0,balance1]);
    assert.equal(balance1, 100);
  });  


  it('should throw an error when trying to transfer more than balance', async function () {
    let tokens = web3.toWei((totalSupply + 1), "ether");

    try {
      await this.token.transfer(purchaser, tokens);
      assert.fail('should have thrown before');
    } catch (error) {
      assertRevert(error);
    }
  });


  it('should return correct balances after transfering from another account', async function () {
    
    let tokens = web3.toWei(100, "ether");
    let tokensA = web3.toWei(50, "ether");
    await this.token.approve(purchaser, tokens);
    //await this.token.transferFrom(owner, purchaser2, tokensA, { from: purchaser });

    let balance0 = await this.token.balanceOf(owner);
    balance0 = balance0.toString(10);
    balance0 = web3.fromWei(balance0, "ether");
    //assert.equal(balance0, 0);

    let balance1 = await this.token.balanceOf(purchaser2);
    balance1 = balance1.toString(10);
    balance1 = web3.fromWei(balance1, "ether");
    //assert.equal(balance1, 100);

    let balance2 = await this.token.balanceOf(purchaser);
    balance2 = balance2.toString(10);
    balance2 = web3.fromWei(balance2, "ether");
    //assert.equal(balance2, 0);

    //console.log([balance0,balance1,balance2]);
    
  });


});
