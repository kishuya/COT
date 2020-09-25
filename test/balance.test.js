import ether from './helpers/ether';
import token from './helpers/token';
import { advanceBlock } from './helpers/advanceToBlock';
import { increaseTimeTo, duration } from './helpers/increaseTime';
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

contract('COTCoinCrowdsale', function ([owner, unsale_owner, purchaser, purchaser2, purchaser3, purchaser4, purchaser5]) {
  const wallet = owner;
  const unsale_owner_wallet = unsale_owner;
  const rate = event_parameter.rate();
  const totalSupply = event_parameter.totalSupply();
  const randomNum = event_parameter.randomNum();
  console.log('randomNum',randomNum);
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


  it('should be token owner', async function () {
    const owner = await this.token.owner();
    owner.should.equal(this.crowdsale.address);
  });

  it('owner should have total token', async function () {
    const owner_totalSupply = await this.token.totalSupply();
    const owner_totalSupply_amount = token(owner_totalSupply);

    //console.log(owner_totalSupply_amount);
    //console.log(typeof(owner_totalSupply_amount));

    owner_totalSupply_amount.should.equal(totalSupply);
  });


  describe('purchase balance check', function () {
    it('should be 0 before purchase', async function () {
      const totalToken_data1 = await this.token.balanceOf(purchaser);
      const totalToken1 = totalToken_data1.toNumber(10);
      totalToken1.should.equal(0);
    });   

    it('total amount of token should not change when premium sale', async function () {
      await increaseTimeTo(this.premiumSales_startTime);
      const whitelist = [purchaser4,purchaser5];// add users into whitelist
      await this.whitelist.importList(whitelist, 3);

      const expect_data = await this.token.balanceOf(owner);
      const expect = token(expect_data.toNumber(10));

      const value1 = ether(25);
      await this.crowdsale.sendTransaction({ value: value1, from: purchaser4 }).should.be.fulfilled;
      const totalToken_data3 = await this.token.balanceOf(purchaser4);
      const totalToken3 = token(totalToken_data3.toNumber(10));
      
      const value2 = ether(25);
      await this.crowdsale.sendTransaction({ value: value2, from: purchaser5 }).should.be.fulfilled;
      const totalToken_data4 = await this.token.balanceOf(purchaser5);
      const totalToken4 = token(totalToken_data4.toNumber(10));

      const owner_holding_totalToken_data = await this.token.balanceOf(owner);
      const owner_holding_totalToken = token(owner_holding_totalToken_data.toNumber(10));

      const total_amount = totalToken3 + totalToken4 + owner_holding_totalToken;
      /*
      console.log(value1);   
      console.log(value2);      
      console.log(owner_holding_totalToken);
      console.log(totalToken3);
      console.log(totalToken4);
      console.log(typeof(owner_holding_totalToken));
      console.log(typeof(totalToken3)); 
      console.log(typeof(totalToken4));      
      */

      total_amount.should.equal(expect);
    });


    it('total amount of token should not change when pre sale', async function () {
      await increaseTimeTo(this.publicSales_startTime);
      const whitelist = [purchaser,purchaser2];// add users into whitelist
      await this.whitelist.importList(whitelist, 1);

      const expect_data = await this.token.balanceOf(owner);
      const expect = token(expect_data.toNumber(10));

      const value1 = ether(25);
      await this.crowdsale.sendTransaction({ value: value1, from: purchaser }).should.be.fulfilled;
      const totalToken_data3 = await this.token.balanceOf(purchaser);
      const totalToken3 = token(totalToken_data3.toNumber(10));
      
      const value2 = ether(25);
      await this.crowdsale.sendTransaction({ value: value2, from: purchaser2 }).should.be.fulfilled;
      const totalToken_data4 = await this.token.balanceOf(purchaser2);
      const totalToken4 = token(totalToken_data4.toNumber(10));

      const owner_holding_totalToken_data = await this.token.balanceOf(owner);
      const owner_holding_totalToken = token(owner_holding_totalToken_data.toNumber(10));

      const total_amount = totalToken3 + totalToken4 + owner_holding_totalToken;

      /*
      console.log(value1);   
      console.log(value2);      
      console.log(owner_holding_totalToken);
      console.log(totalToken3);
      console.log(totalToken4);
      console.log(typeof(owner_holding_totalToken));
      console.log(typeof(totalToken3)); 
      console.log(typeof(totalToken4));      
      */

      total_amount.should.equal(expect);
    });

    it('should not be 0 after purchase when public sale', async function () {
      await increaseTimeTo(this.publicSales_startTime);
      const whitelist = [purchaser,purchaser2];// add users into whitelist
      await this.whitelist.importList(whitelist, 2);
      await this.crowdsale.sendTransaction({ value: value, from: purchaser }).should.be.fulfilled;

      const totalToken_data2 = await this.token.balanceOf(purchaser);
      const totalToken2 = token(totalToken_data2.toNumber(10));
      const expectToken2 = token((rate*value));

      /*
      console.log(value);      
      console.log(totalToken2);
      console.log(expectToken2);
      console.log(typeof(totalToken2));
      console.log(typeof(expectToken2));      
      */

      totalToken2.should.equal(expectToken2);
    });

    it('total amount of token should not change when public sale', async function () {
      await increaseTimeTo(this.publicSales_startTime);
      const whitelist = [purchaser,purchaser2];// add users into whitelist
      await this.whitelist.importList(whitelist, 2);

      const expect_data = await this.token.balanceOf(owner);
      const expect = token(expect_data.toNumber(10));

      const value1 = ether((Math.random() * 10 + 1).toFixed(2));
      await this.crowdsale.sendTransaction({ value: value1, from: purchaser }).should.be.fulfilled;
      const totalToken_data3 = await this.token.balanceOf(purchaser);
      const totalToken3 = token(totalToken_data3.toNumber(10));
      
      const value2 = ether((Math.random() * 10 + 1).toFixed(2))
      await this.crowdsale.sendTransaction({ value: value2, from: purchaser2 }).should.be.fulfilled;
      const totalToken_data4 = await this.token.balanceOf(purchaser2);
      const totalToken4 = token(totalToken_data4.toNumber(10));

      const owner_holding_totalToken_data = await this.token.balanceOf(owner);
      const owner_holding_totalToken = token(owner_holding_totalToken_data.toNumber(10));

      const total_amount = totalToken3 + totalToken4 + owner_holding_totalToken;

      /*
      console.log(value1);   
      console.log(value2);      
      console.log(owner_holding_totalToken);
      console.log(totalToken3);
      console.log(totalToken4);
      console.log(typeof(owner_holding_totalToken));
      console.log(typeof(totalToken3)); 
      console.log(typeof(totalToken4));      
      */

      total_amount.should.equal(expect);
    });

    it('owner should get eth after buyer purchased token', async function () {
      await increaseTimeTo(this.publicSales_startTime);
      const whitelist = [purchaser,purchaser2];// add users into whitelist
      await this.whitelist.importList(whitelist, 2);

      const purchaser1_balance = web3.fromWei(web3.eth.getBalance(purchaser), "ether"); 
      const purchaser2_balance = web3.fromWei(web3.eth.getBalance(purchaser2), "ether"); 
      var owner_balance = web3.fromWei(web3.eth.getBalance(owner), "ether"); 
      owner_balance = owner_balance.toNumber(10);

      //console.log([purchaser1_balance,purchaser2_balance,owner_balance]);

      const value1 = ether(10);
      await this.crowdsale.sendTransaction({ value: value1, from: purchaser }).should.be.fulfilled;
      
      const value2 = ether(15)
      await this.crowdsale.sendTransaction({ value: value2, from: purchaser2 }).should.be.fulfilled;

      const purchaser1_balance_af = web3.fromWei(web3.eth.getBalance(purchaser), "ether"); 
      const purchaser2_balance_af = web3.fromWei(web3.eth.getBalance(purchaser2), "ether"); 
      var owner_balance_af = web3.fromWei(web3.eth.getBalance(owner), "ether"); 
      owner_balance_af = owner_balance_af.toNumber(10);

      //console.log([purchaser1_balance_af,purchaser2_balance_af,owner_balance_af]);
      owner_balance_af.should.equal((owner_balance + 10 + 15));
    });

  });

  describe('sale remain balance check', function () {
  
    it('should accept payment if amount of token that user bought is lower than remain amount of sale ', async function () {
      const expect_remain_totalToken_data = await this.token.balanceOf(owner);
      const expect_remain_totalToken = token(expect_remain_totalToken_data.toNumber(10));


      await increaseTimeTo(this.premiumSales_startTime);
      const whitelist1 = [purchaser5];// add users into whitelist
      await this.whitelist.importList(whitelist1, 3);
      await this.crowdsale.sendTransaction({ value: ether(25), from: purchaser5 }).should.be.fulfilled;
      const totalToken_data5 = await this.token.balanceOf(purchaser5);
      const totalToken5 = token(totalToken_data5.toNumber(10));

      await increaseTimeTo(this.publicSales_startTime);
      const whitelist2 = [purchaser,purchaser2];// add users into whitelist
      await this.whitelist.importList(whitelist2, 1);

      const value1 = ether(25);
      await this.crowdsale.sendTransaction({ value: value1, from: purchaser }).should.be.fulfilled;
      const totalToken_data3 = await this.token.balanceOf(purchaser);
      const totalToken3 = token(totalToken_data3.toNumber(10));
      
      const value2 = ether(25);
      await this.crowdsale.sendTransaction({ value: value2, from: purchaser2 }).should.be.fulfilled;
      const totalToken_data4 = await this.token.balanceOf(purchaser2);
      const totalToken4 = token(totalToken_data4.toNumber(10));

      const remain_totalToken_data = await this.token.balanceOf(owner);
      const remain_totalToken = token(remain_totalToken_data.toNumber(10));

      /*
      console.log(totalToken3);
      console.log(totalToken4);
      console.log(remain_totalToken);
      console.log(expect_remain_totalToken);
      */
      expect_remain_totalToken.should.equal((totalToken3 + totalToken4 + totalToken5 + remain_totalToken));
    });

  });
});
