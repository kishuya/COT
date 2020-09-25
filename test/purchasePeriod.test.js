import ether from './helpers/ether';
import { advanceBlock } from './helpers/advanceToBlock';
import { increaseTimeTo, duration } from './helpers/increaseTime';
import EVMRevert from './helpers/EVMRevert';
import { event_period } from './helpers/eventPeriod';
import { event_parameter } from './helpers/eventParameters';

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

contract('COTCoinCrowdsale', function ([owner, unsale_owner, purchaser, purchaser2, purchaser3, purchaser4, purchaser5, purchaser6, purchaser7]) {
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

  it('should be ended only after end', async function () {
    let ended = await this.crowdsale.hasEnded();
    ended.should.equal(false);
    await increaseTimeTo(this.afterEndTime);
    ended = await this.crowdsale.hasEnded();
    ended.should.equal(true);
  });

  describe('accepting payments', function () {
    it('sale_token_owner can not buy token after premium sale-start', async function () {
      await increaseTimeTo(this.premiumSales_startTime);
      const whitelist = [owner];// add users into whitelist
      await this.whitelist.importList(whitelist, 3);
      await this.crowdsale.sendTransaction({ value: ether(25), from: owner }).should.be.rejectedWith(EVMRevert);
    });

    it('sale_token_owner can not buy token after pre sale-start', async function () {
      await increaseTimeTo(this.preSales_startTime);
      const whitelist = [owner];// add users into whitelist
      await this.whitelist.importList(whitelist, 1);
      await this.crowdsale.sendTransaction({ value: ether(25), from: owner }).should.be.rejectedWith(EVMRevert);
    });

    it('sale_token_owner can not buy token after public sale-start', async function () {
      await increaseTimeTo(this.publicSales_startTime);
      const whitelist = [owner];// add users into whitelist
      await this.whitelist.importList(whitelist, 2);
      await this.crowdsale.sendTransaction({ value: value, from: owner }).should.be.rejectedWith(EVMRevert);
      await this.crowdsale.buyTokens(owner, { value: value, from: owner }).should.be.rejectedWith(EVMRevert);
    });

    it('unsale_token_owner can not buy token after premium sale-start', async function () {
      await increaseTimeTo(this.premiumSales_startTime);
      const whitelist = [unsale_owner];// add users into whitelist
      await this.whitelist.importList(whitelist, 3);
      await this.crowdsale.sendTransaction({ value: ether(25), from: unsale_owner }).should.be.rejectedWith(EVMRevert);
    });

    it('unsale_token_owner can not buy token after pre sale-start', async function () {
      await increaseTimeTo(this.preSales_startTime);
      const whitelist = [unsale_owner];// add users into whitelist
      await this.whitelist.importList(whitelist, 1);
      await this.crowdsale.sendTransaction({ value: ether(25), from: unsale_owner }).should.be.rejectedWith(EVMRevert);
    });

    it('unsale_token_owner can not buy token after public sale-start', async function () {
      await increaseTimeTo(this.publicSales_startTime);
      const whitelist = [unsale_owner];// add users into whitelist
      await this.whitelist.importList(whitelist, 2);
      await this.crowdsale.sendTransaction({ value: value, from: unsale_owner }).should.be.rejectedWith(EVMRevert);
      await this.crowdsale.buyTokens(unsale_owner, { value: value, from: unsale_owner }).should.be.rejectedWith(EVMRevert);
    });

    it('should reject payments before start', async function () {
      await this.crowdsale.send(value).should.be.rejectedWith(EVMRevert);
      const whitelist = [purchaser];// add users into whitelist
      await this.whitelist.importList(whitelist, 1);
      await this.crowdsale.sendTransaction({ value: value, from: purchaser }).should.be.rejectedWith(EVMRevert);
      await this.crowdsale.buyTokens(purchaser, { from: purchaser, value: value }).should.be.rejectedWith(EVMRevert);
    });

    it('should accept payments after premium sale-start', async function () {
      await increaseTimeTo(this.preSales_startTime);
      const whitelist = [purchaser4];// add users into whitelist
      await this.whitelist.importList(whitelist, 3);
      await this.crowdsale.sendTransaction({ value: ether(25), from: purchaser4 }).should.be.fulfilled;
    });  

    it('should accept payments after pre sale-start', async function () {
      await increaseTimeTo(this.preSales_startTime);
      const whitelist = [purchaser2];// add users into whitelist
      await this.whitelist.importList(whitelist, 1);
      await this.crowdsale.sendTransaction({ value: ether(25), from: purchaser2 }).should.be.fulfilled;
    });   

    it('should reject payments after pre sale-end', async function () {
      await increaseTimeTo(this.afterPreSales_endTime);
      const whitelist = [purchaser3];// add users into whitelist
      await this.whitelist.importList(whitelist, 1);
      await this.crowdsale.sendTransaction({ value: ether(25), from: purchaser3 }).should.be.rejectedWith(EVMRevert);
    }); 

    it('should reject payments after public sale-end', async function () {
      await increaseTimeTo(this.afterEndTime);
      const whitelist = [purchaser];// add users into whitelist
      await this.whitelist.importList(whitelist, 2);
      await this.crowdsale.sendTransaction({ value: value, from: purchaser }).should.be.rejectedWith(EVMRevert);
      await this.crowdsale.buyTokens(purchaser, { value: value, from: purchaser }).should.be.rejectedWith(EVMRevert);
    });

    it('should reject payments if eth amount less then lowest_weiAmount after premium sale-start', async function () {
      await increaseTimeTo(this.premiumSales_startTime);
      const whitelist = [purchaser4];// add users into whitelist
      await this.whitelist.importList(whitelist, 3);

      //lowest_weiAmount was be setted to 1*10**18 for this test
      await this.crowdsale.sendTransaction({ value: ether(0.9999), from: purchaser4 }).should.be.rejectedWith(EVMRevert);
    });

    it('should reject payments if eth amount less then lowest_weiAmount after pre sale-start', async function () {
      await increaseTimeTo(this.preSales_startTime);
      const whitelist = [purchaser];// add users into whitelist
      await this.whitelist.importList(whitelist, 1);

      //lowest_weiAmount was be setted to 1*10**18 for this test
      await this.crowdsale.sendTransaction({ value: ether(0.9999), from: purchaser }).should.be.rejectedWith(EVMRevert);
    });

    it('should accept payments if eth amount less then lowest_weiAmount after public sale-start', async function () {
      await increaseTimeTo(this.publicSales_startTime);
      const whitelist = [purchaser];// add users into whitelist
      await this.whitelist.importList(whitelist, 2);
      await this.crowdsale.sendTransaction({ value: ether(0.2), from: purchaser }).should.be.fulfilled;
      await this.crowdsale.buyTokens(purchaser, { value: ether(0.2), from: purchaser }).should.be.fulfilled;
    });

    it('should reject payments if　amount of COT less than 1', async function () {
      await increaseTimeTo(this.publicSales_startTime);
      const whitelist = [purchaser];// add users into whitelist
      await this.whitelist.importList(whitelist, 2);
      await this.crowdsale.sendTransaction({ value: ether(0.000099), from: purchaser }).should.be.rejectedWith(EVMRevert);
      await this.crowdsale.buyTokens(purchaser, { value: ether(0.000099), from: purchaser }).should.be.rejectedWith(EVMRevert);
    });    

  });

  describe('purchase authority test in whitelist', function () {

    it('should accept payments if premium user purchase token in permium sale period', async function () {
      await increaseTimeTo(this.premiumSales_startTime);
      const whitelist = [purchaser5];// add users into whitelist
      await this.whitelist.importList(whitelist, 3);
      await this.crowdsale.sendTransaction({ value: ether(25), from: purchaser5 }).should.be.fulfilled;
    });

    it('should accept payments if premium user purchase token in pre sale period', async function () {
      await increaseTimeTo(this.preSales_startTime);
      const whitelist = [purchaser5];// add users into whitelist
      await this.whitelist.importList(whitelist, 3);
      await this.crowdsale.sendTransaction({ value: ether(25), from: purchaser5 }).should.be.fulfilled;
    });

    it('should accept payments if premium user purchase token in public sale period', async function () {
      await increaseTimeTo(this.publicSales_startTime);
      const whitelist = [purchaser5];// add users into whitelist
      await this.whitelist.importList(whitelist, 3);
      await this.crowdsale.sendTransaction({ value: ether(0.001), from: purchaser5 }).should.be.fulfilled;
    });

    it('should reject payments if pre user purchase token in permium sale period', async function () {
      await increaseTimeTo(this.premiumSales_startTime);
      const whitelist = [purchaser6];// add users into whitelist
      await this.whitelist.importList(whitelist, 1);
      await this.crowdsale.sendTransaction({ value: ether(25), from: purchaser6 }).should.be.rejectedWith(EVMRevert);
    });

    it('should accept payments if pre user purchase token in per sale period', async function () {
      await increaseTimeTo(this.preSales_startTime);
      const whitelist = [purchaser6];// add users into whitelist
      await this.whitelist.importList(whitelist, 1);
      await this.crowdsale.sendTransaction({ value: ether(25), from: purchaser6 }).should.be.fulfilled;
    });  

    it('should accept payments if pre user purchase token in public sale period', async function () {
      await increaseTimeTo(this.publicSales_startTime);
      const whitelist = [purchaser6];// add users into whitelist
      await this.whitelist.importList(whitelist, 1);
      await this.crowdsale.sendTransaction({ value: ether(0.001), from: purchaser6 }).should.be.fulfilled;
    });   

    it('should reject payments if public user purchase token in permium sale period', async function () {
      await increaseTimeTo(this.premiumSales_startTime);
      const whitelist = [purchaser7];// add users into whitelist
      await this.whitelist.importList(whitelist, 2);
      await this.crowdsale.sendTransaction({ value: ether(25), from: purchaser7 }).should.be.rejectedWith(EVMRevert);
    });

    it('should reject payments if public user purchase token in per sale period', async function () {
      await increaseTimeTo(this.preSales_startTime);
      const whitelist = [purchaser7];// add users into whitelist
      await this.whitelist.importList(whitelist, 2);
      await this.crowdsale.sendTransaction({ value: ether(25), from: purchaser7 }).should.be.rejectedWith(EVMRevert);
    });  

    it('should accept payments if public user purchase token in public sale period', async function () {
      await increaseTimeTo(this.publicSales_startTime);
      const whitelist = [purchaser7];// add users into whitelist
      await this.whitelist.importList(whitelist, 2);
      await this.crowdsale.sendTransaction({ value: ether(0.001), from: purchaser7 }).should.be.fulfilled;
    }); 

  });
});
