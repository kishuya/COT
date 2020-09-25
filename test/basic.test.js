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

  describe('token transaction', function () {
    it('token can be given from sale_token_owner before sale start', async function () {
      const tokens = web3.toWei(100, "ether");
      await this.token.transfer(purchaser, tokens,{from: owner}).should.be.fulfilled;
      const totalTokenBalance = await this.token.balanceOf(purchaser);
      let totalToken = token(totalTokenBalance.toNumber(10));

      totalToken.should.equal(100);

    });

    it('token can be given from sale_token_owner after premium sale start', async function () {
      await increaseTimeTo(this.premiumSales_startTime);
      const tokens = web3.toWei(100, "ether");
      await this.token.transfer(purchaser, tokens,{from: owner}).should.be.fulfilled;
      const totalTokenBalance = await this.token.balanceOf(purchaser);
      let totalToken = token(totalTokenBalance.toNumber(10));

      totalToken.should.equal(100);
    });   

    it('token can be given from sale_token_owner after pre sale start', async function () {
      await increaseTimeTo(this.preSales_startTime);
      const tokens = web3.toWei(100, "ether");
      await this.token.transfer(purchaser, tokens,{from: owner}).should.be.fulfilled;
      const totalTokenBalance = await this.token.balanceOf(purchaser);
      let totalToken = token(totalTokenBalance.toNumber(10));

      totalToken.should.equal(100);
    });   

    it('token can be given from sale_token_owner after public sale start', async function () {
      await increaseTimeTo(this.publicSales_startTime);
      const tokens = web3.toWei(100, "ether");
      await this.token.transfer(purchaser, tokens,{from: owner}).should.be.fulfilled;
      const totalTokenBalance = await this.token.balanceOf(purchaser);
      let totalToken = token(totalTokenBalance.toNumber(10));

      totalToken.should.equal(100);
    }); 

    it('token can be given from sale_token_owner after sale end', async function () {
      await increaseTimeTo(this.afterEndTime);
      const tokens = web3.toWei(100, "ether");
      await this.token.transfer(purchaser, tokens,{from: owner}).should.be.fulfilled;
      const totalTokenBalance = await this.token.balanceOf(purchaser);
      let totalToken = token(totalTokenBalance.toNumber(10));

      totalToken.should.equal(100);
      
    });

    it('token can be given from unsale_token_owner before sale start', async function () {
      const tokens = web3.toWei(100, "ether");
      await this.token.transfer(purchaser, tokens,{from: unsale_owner_wallet}).should.be.fulfilled;
      const totalTokenBalance = await this.token.balanceOf(purchaser);
      let totalToken = token(totalTokenBalance.toNumber(10));

      totalToken.should.equal(100);

    });

    it('token can be given from unsale_token_owner after premium sale start', async function () {
      await increaseTimeTo(this.premiumSales_startTime);
      const tokens = web3.toWei(100, "ether");
      await this.token.transfer(purchaser, tokens,{from: unsale_owner_wallet}).should.be.fulfilled;
      const totalTokenBalance = await this.token.balanceOf(purchaser);
      let totalToken = token(totalTokenBalance.toNumber(10));

      totalToken.should.equal(100);
    });   

    it('token can be given from unsale_token_owner after pre sale start', async function () {
      await increaseTimeTo(this.preSales_startTime);
      const tokens = web3.toWei(100, "ether");
      await this.token.transfer(purchaser, tokens,{from: unsale_owner_wallet}).should.be.fulfilled;
      const totalTokenBalance = await this.token.balanceOf(purchaser);
      let totalToken = token(totalTokenBalance.toNumber(10));

      totalToken.should.equal(100);
    });   

    it('token can be given from unsale_token_owner after public sale start', async function () {
      await increaseTimeTo(this.publicSales_startTime);
      const tokens = web3.toWei(100, "ether");
      await this.token.transfer(purchaser, tokens,{from: unsale_owner_wallet}).should.be.fulfilled;
      const totalTokenBalance = await this.token.balanceOf(purchaser);
      let totalToken = token(totalTokenBalance.toNumber(10));

      totalToken.should.equal(100);
    }); 

    it('token can be given from unsale_token_owner after sale end', async function () {
      await increaseTimeTo(this.afterEndTime);
      const tokens = web3.toWei(100, "ether");
      await this.token.transfer(purchaser, tokens,{from: unsale_owner_wallet}).should.be.fulfilled;
      const totalTokenBalance = await this.token.balanceOf(purchaser);
      let totalToken = token(totalTokenBalance.toNumber(10));

      totalToken.should.equal(100);
      
    });

    it('total amount of token should not be changed before sale start', async function () {
      const tokens = web3.toWei(100, "ether");
      await this.token.transfer(purchaser, tokens,{from: owner}).should.be.fulfilled;
      await this.token.transfer(purchaser2, tokens,{from: owner}).should.be.fulfilled;

      const totalTokenBalance1 = await this.token.balanceOf(purchaser);
      let totalToken1 = token(totalTokenBalance1.toNumber(10));


      const totalTokenBalance2 = await this.token.balanceOf(purchaser2);
      let totalToken2 = token(totalTokenBalance2.toNumber(10));


      const totalToken = totalToken1 + totalToken2;

      totalToken.should.equal(200);
    });   

    it('total amount of token should not be changed after sale start', async function () {
      await increaseTimeTo(this.premiumSales_startTime);
      const tokens = web3.toWei(100, "ether");
      await this.token.transfer(purchaser, tokens,{from: owner}).should.be.fulfilled;
      await this.token.transfer(purchaser2, tokens,{from: owner}).should.be.fulfilled;

      const totalTokenBalance1 = await this.token.balanceOf(purchaser);
      let totalToken1 = token(totalTokenBalance1.toNumber(10));

      const totalTokenBalance2 = await this.token.balanceOf(purchaser2);
      let totalToken2 = token(totalTokenBalance2.toNumber(10));

      const totalToken = totalToken1 + totalToken2;
      totalToken.should.equal(200);
      
    });     

    it('total amount of token should not be changed after sale end', async function () {
      await increaseTimeTo(this.afterEndTime);
      const tokens = web3.toWei(100, "ether");
      await this.token.transfer(purchaser, tokens,{from: owner}).should.be.fulfilled;
      await this.token.transfer(purchaser2, tokens,{from: owner}).should.be.fulfilled;

      const totalTokenBalance1 = await this.token.balanceOf(purchaser);
      let totalToken1 = token(totalTokenBalance1.toNumber(10));

      const totalTokenBalance2 = await this.token.balanceOf(purchaser2);
      let totalToken2 = token(totalTokenBalance2.toNumber(10));

      const totalToken = totalToken1 + totalToken2;
      totalToken.should.equal(200);
      
    });        

  });
});
