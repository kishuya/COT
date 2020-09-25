import ether from './helpers/ether';
import token from './helpers/token';
import { advanceBlock } from './helpers/advanceToBlock';
import { increaseTimeTo, duration } from './helpers/increaseTime';
import EVMRevert from './helpers/EVMRevert';
import { event_period } from './helpers/eventPeriod';
import { event_parameter } from './helpers/eventParameters';
import { event_whitelist } from './helpers/whitelistGenerate.js';

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
  const randomNum = event_parameter.randomNum();
  const value = ether(randomNum);
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
    this.lockUpTime_2 = event_period.lockUpTime(this.lockUpTime); 
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

  describe('lock up token transaction', function () {
    it('should reject if token does not unlock yet', async function () {
      const tokens = web3.toWei(100, "ether");
      await this.token.transfer(purchaser, tokens,{from: owner}).should.be.fulfilled;
      await this.token.transfer(purchaser2, tokens,{from: purchaser}).should.be.rejectedWith(EVMRevert);
    });

    it('should reject if token does not unlock yet when premium sale period', async function () {
      await increaseTimeTo(this.premiumSales_startTime);
      const tokens = web3.toWei(100, "ether");
      await this.token.transfer(purchaser, tokens,{from: owner}).should.be.fulfilled;
      await this.token.transfer(purchaser2, tokens,{from: purchaser}).should.be.rejectedWith(EVMRevert);
    }); 

    it('should reject if token does not unlock yet when pre sale period', async function () {
      await increaseTimeTo(this.preSales_startTime);
      const tokens = web3.toWei(100, "ether");
      await this.token.transfer(purchaser, tokens,{from: owner}).should.be.fulfilled;
      await this.token.transfer(purchaser2, tokens,{from: purchaser}).should.be.rejectedWith(EVMRevert);
    }); 

    it('should reject if token does not unlock yet when public sale period', async function () {
      await increaseTimeTo(this.publicSales_startTime);
      const tokens = web3.toWei(100, "ether");
      await this.token.transfer(purchaser, tokens,{from: owner}).should.be.fulfilled;
      await this.token.transfer(purchaser2, tokens,{from: purchaser}).should.be.rejectedWith(EVMRevert);
    }); 

    it('should accept if token have unlocked', async function () {
      await increaseTimeTo(this.lockUpTime);
      const tokens = web3.toWei(100, "ether");
      await this.token.transfer(purchaser, tokens,{from: owner}).should.be.fulfilled;
      await this.token.transfer(purchaser2, tokens,{from: purchaser}).should.be.fulfilled;
    }); 

    it('should reject after update lockup time ', async function () {
      await increaseTimeTo(this.lockUpTime);
      const tokens = web3.toWei(100, "ether");
      await this.token.transfer(purchaser, tokens,{from: owner}).should.be.fulfilled;
      await this.token.transfer(purchaser2, tokens,{from: purchaser}).should.be.fulfilled;

      await this.lockup.updateLockup(this.lockUpTime_2);
      await this.token.transfer(purchaser, tokens,{from: owner}).should.be.fulfilled;
      await this.token.transfer(purchaser2, tokens,{from: purchaser}).should.be.rejectedWith(EVMRevert);
    }); 

    it('should appect if time reach the new lockup time after update lockup time ', async function () {
      await increaseTimeTo(this.lockUpTime);
      const tokens = web3.toWei(100, "ether");
      await this.token.transfer(purchaser, tokens,{from: owner}).should.be.fulfilled;
      await this.token.transfer(purchaser2, tokens,{from: purchaser}).should.be.fulfilled;

      await this.lockup.updateLockup(this.lockUpTime_2);
      await this.token.transfer(purchaser, tokens,{from: owner}).should.be.fulfilled;
      await this.token.transfer(purchaser2, tokens,{from: purchaser}).should.be.rejectedWith(EVMRevert);

      await increaseTimeTo(this.lockUpTime_2);
      await this.token.transfer(purchaser, tokens,{from: owner}).should.be.fulfilled;
      await this.token.transfer(purchaser2, tokens,{from: purchaser}).should.be.fulfilled;
    }); 
  });
});
