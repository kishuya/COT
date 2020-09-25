import ether from './helpers/ether';
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

contract('COTCoinCrowdsale', function ([owner, unsale_owner, purchaser, purchaser2, purchaser3, purchaser4]) {
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
    this.running_time = 1000;
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


  describe('upload whitelist file for pre sale', function () {
    
    it('can upload 5000 user address', async function () {
      await increaseTimeTo(this.preSales_startTime);
      const whitelist_file = event_whitelist.generate(this.running_time);
      //console.log(whitelist_file);


      var new_list = [];
      for(var index = 0; index < whitelist_file.length; index+=100){
        new_list.push(whitelist_file.slice(index,index+100));
      }

      for(var list_index = 0; list_index < new_list.length; list_index ++ ){
        await this.whitelist.importList(new_list[list_index], 1).should.be.fulfilled;  
      }
      
      for(var i = 0; i < whitelist_file.length; i ++){
        //console.log('check ',whitelist_file[i]);
        var result = await this.whitelist.checkList(whitelist_file[i]);
        result = result.toString(10);
        //console.log(result);
        result.should.equal('1');     
      }
      
    });
    
    it('can upload in anytime', async function () {
      const num = 100;
      
      const whitelist_file = event_whitelist.generate(num);
      //console.log(whitelist_file);

      var new_list = [];
      for(var index = 0; index < whitelist_file.length; index+=20){
        new_list.push(whitelist_file.slice(index,index+20));
      }

      await this.whitelist.importList(new_list[0], 1).should.be.fulfilled;

      await increaseTimeTo(this.preSales_startTime);

      await this.whitelist.importList(new_list[1], 1).should.be.fulfilled;

      await increaseTimeTo(this.afterPreSales_endTime);

      await this.whitelist.importList(new_list[2], 1).should.be.fulfilled;

      await increaseTimeTo(this.publicSales_startTime);

      await this.whitelist.importList(new_list[3], 1).should.be.fulfilled;

      await increaseTimeTo(this.afterEndTime);

      await this.whitelist.importList(new_list[4], 1).should.be.fulfilled;
      
      for(var i = 0; i < whitelist_file.length; i ++){
        //console.log('check ',whitelist_file[i]);
        var result = await this.whitelist.checkList(whitelist_file[i]);
        result = result.toString(10);
        result.should.equal('1');     
      }
      
    });   
    
  });

  describe('accepting payments　for pre sale whitelist', function () {

    it('owner can not buy token after pre sale-start even if owner is in whitelist', async function () {
      await increaseTimeTo(this.preSales_startTime);
      const whitelist_have_owner = [owner, owner, purchaser,purchaser2];// add users and owner into whitelist
      await this.whitelist.importList(whitelist_have_owner, 1);      
      await this.crowdsale.sendTransaction({ value: value, from: owner }).should.be.rejectedWith(EVMRevert);
      await this.crowdsale.buyTokens(owner, { value: value, from: owner }).should.be.rejectedWith(EVMRevert);
    });

    it('owner can not buy token after public sale-start even if owner is in whitelist', async function () {
      await increaseTimeTo(this.publicSales_startTime);
      const whitelist_have_owner = [owner, owner, purchaser,purchaser2];// add users and owner into whitelist
      await this.whitelist.importList(whitelist_have_owner, 1);      
      await this.crowdsale.sendTransaction({ value: value, from: owner }).should.be.rejectedWith(EVMRevert);
      await this.crowdsale.buyTokens(owner, { value: value, from: owner }).should.be.rejectedWith(EVMRevert);
    });

    it('should reject payments after pre sale-start if user not in whitelist', async function () {
      await increaseTimeTo(this.preSales_startTime);
      await this.crowdsale.sendTransaction({ value: value, from: purchaser }).should.be.rejectedWith(EVMRevert);
      await this.crowdsale.buyTokens(purchaser, { value: value, from: purchaser }).should.be.rejectedWith(EVMRevert);
    });     

    it('should reject payments after public sale-start if user not in whitelist', async function () {
      await increaseTimeTo(this.publicSales_startTime);
      await this.crowdsale.sendTransaction({ value: value, from: purchaser }).should.be.rejectedWith(EVMRevert);
      await this.crowdsale.buyTokens(purchaser, { value: value, from: purchaser }).should.be.rejectedWith(EVMRevert);
    });  

    it('should accept payments after pre sale-start if user in whitelist', async function () {
      await increaseTimeTo(this.preSales_startTime);
      const whitelist = [purchaser,purchaser2];// add users into whitelist
      await this.whitelist.importList(whitelist, 1);
      await this.crowdsale.sendTransaction({ value: ether(25), from: purchaser }).should.be.fulfilled;
      await this.crowdsale.buyTokens(purchaser, { value: ether(25), from: purchaser }).should.be.fulfilled;
    });

    it('should accept payments after public sale-start if user in whitelist', async function () {
      await increaseTimeTo(this.publicSales_startTime);
      const whitelist = [purchaser,purchaser2];// add users into whitelist
      await this.whitelist.importList(whitelist, 1);
      await this.crowdsale.sendTransaction({ value: value, from: purchaser }).should.be.fulfilled;
      await this.crowdsale.buyTokens(purchaser, { value: value, from: purchaser }).should.be.fulfilled;
    });

  });

  describe('upload whitelist file for public sale', function () {
    
    it('can upload 5000 user address', async function () {
      await increaseTimeTo(this.publicSales_startTime);
      const whitelist_file = event_whitelist.generate(this.running_time);
      //console.log(whitelist_file);


      var new_list = [];
      for(var index = 0; index < whitelist_file.length; index+=100){
        new_list.push(whitelist_file.slice(index,index+100));
      }

      for(var list_index = 0; list_index < new_list.length; list_index ++ ){
        await this.whitelist.importList(new_list[list_index], 2).should.be.fulfilled;  
      }
      
      for(var i = 0; i < whitelist_file.length; i ++){
        //console.log('check ',whitelist_file[i]);
        var result = await this.whitelist.checkList(whitelist_file[i]);
        result = result.toString(10);
        //console.log(result);
        result.should.equal('2');     
      }
      
    });
    
    it('can upload in anytime', async function () {
      const num = 100;
      
      const whitelist_file = event_whitelist.generate(num);
      //console.log(whitelist_file);

      var new_list = [];
      for(var index = 0; index < whitelist_file.length; index+=20){
        new_list.push(whitelist_file.slice(index,index+20));
      }

      await this.whitelist.importList(new_list[0], 2).should.be.fulfilled;

      await increaseTimeTo(this.preSales_startTime);

      await this.whitelist.importList(new_list[1], 2).should.be.fulfilled;

      await increaseTimeTo(this.afterPreSales_endTime);

      await this.whitelist.importList(new_list[2], 2).should.be.fulfilled;

      await increaseTimeTo(this.publicSales_startTime);

      await this.whitelist.importList(new_list[3], 2).should.be.fulfilled;

      await increaseTimeTo(this.afterEndTime);

      await this.whitelist.importList(new_list[4], 2).should.be.fulfilled;
      
      for(var i = 0; i < whitelist_file.length; i ++){
        //console.log('check ',whitelist_file[i]);
        var result = await this.whitelist.checkList(whitelist_file[i]);
        result = result.toString(10);
        result.should.equal('2');     
      }
      
    });   
    
  });  

  describe('accepting payments　for public sale whitelist', function () {

    it('owner can not buy token after pre sale-start even if owner is in public sale whitelist', async function () {
      await increaseTimeTo(this.preSales_startTime);
      const whitelist_have_owner = [owner, owner, purchaser,purchaser2];// add users and owner into whitelist
      await this.whitelist.importList(whitelist_have_owner, 2);      
      await this.crowdsale.sendTransaction({ value: value, from: owner }).should.be.rejectedWith(EVMRevert);
      await this.crowdsale.buyTokens(owner, { value: value, from: owner }).should.be.rejectedWith(EVMRevert);
    });

    it('owner can not buy token after public sale-start even if owner is in public sale whitelist', async function () {
      await increaseTimeTo(this.publicSales_startTime);
      const whitelist_have_owner = [owner, owner, purchaser,purchaser2];// add users and owner into whitelist
      await this.whitelist.importList(whitelist_have_owner, 2);      
      await this.crowdsale.sendTransaction({ value: value, from: owner }).should.be.rejectedWith(EVMRevert);
      await this.crowdsale.buyTokens(owner, { value: value, from: owner }).should.be.rejectedWith(EVMRevert);
    });

    it('should reject payments after pre sale-start if user is in public sale whitelist', async function () {
      await increaseTimeTo(this.preSales_startTime);
      const whitelist = [ purchaser,purchaser2];// add users and owner into whitelist
      await this.whitelist.importList(whitelist, 2);       
      await this.crowdsale.sendTransaction({ value: value, from: purchaser }).should.be.rejectedWith(EVMRevert);
      await this.crowdsale.buyTokens(purchaser, { value: value, from: purchaser }).should.be.rejectedWith(EVMRevert);
    });     

    it('should reject payments after public sale-start if user not in public sale whitelist', async function () {
      await increaseTimeTo(this.publicSales_startTime);
      await this.crowdsale.sendTransaction({ value: value, from: purchaser }).should.be.rejectedWith(EVMRevert);
      await this.crowdsale.buyTokens(purchaser, { value: value, from: purchaser }).should.be.rejectedWith(EVMRevert);
    });  

    it('should accept payments after public sale-start if user in public sale whitelist', async function () {
      await increaseTimeTo(this.publicSales_startTime);
      const whitelist = [purchaser,purchaser2];// add users into whitelist
      await this.whitelist.importList(whitelist, 2);
      await this.crowdsale.sendTransaction({ value: ether(2), from: purchaser2 }).should.be.fulfilled;
      await this.crowdsale.buyTokens(purchaser2, { value: ether(2), from: purchaser2 }).should.be.fulfilled;
    });

  });  
  
  describe('upload whitelist file for premium sale', function () {
    
    it('can upload 5000 user address', async function () {
      await increaseTimeTo(this.publicSales_startTime);
      const whitelist_file = event_whitelist.generate(this.running_time);
      //console.log(whitelist_file);


      var new_list = [];
      for(var index = 0; index < whitelist_file.length; index+=100){
        new_list.push(whitelist_file.slice(index,index+100));
      }

      for(var list_index = 0; list_index < new_list.length; list_index ++ ){
        await this.whitelist.importList(new_list[list_index], 3).should.be.fulfilled;  
      }
      
      for(var i = 0; i < whitelist_file.length; i ++){
        //console.log('check ',whitelist_file[i]);
        var result = await this.whitelist.checkList(whitelist_file[i]);
        result = result.toString(10);
        //console.log(result);
        result.should.equal('3');     
      }
      
    });
    
    it('can upload in anytime', async function () {
      const num = 100;
      
      const whitelist_file = event_whitelist.generate(num);
      //console.log(whitelist_file);

      var new_list = [];
      for(var index = 0; index < whitelist_file.length; index+=20){
        new_list.push(whitelist_file.slice(index,index+20));
      }

      await this.whitelist.importList(new_list[0], 3).should.be.fulfilled;

      await increaseTimeTo(this.preSales_startTime);

      await this.whitelist.importList(new_list[1], 3).should.be.fulfilled;

      await increaseTimeTo(this.afterPreSales_endTime);

      await this.whitelist.importList(new_list[2], 3).should.be.fulfilled;

      await increaseTimeTo(this.publicSales_startTime);

      await this.whitelist.importList(new_list[3], 3).should.be.fulfilled;

      await increaseTimeTo(this.afterEndTime);

      await this.whitelist.importList(new_list[4], 3).should.be.fulfilled;
      
      for(var i = 0; i < whitelist_file.length; i ++){
        //console.log('check ',whitelist_file[i]);
        var result = await this.whitelist.checkList(whitelist_file[i]);
        result = result.toString(10);
        result.should.equal('3');     
      }
      
    });   
    
  });  

  describe('accepting payments　for premium sale whitelist', function () {

    it('owner can not buy token after premium sale-start even if owner is in premium sale whitelist', async function () {
      await increaseTimeTo(this.premiumSales_startTime);
      const whitelist_have_owner = [owner, owner, purchaser,purchaser2];// add users and owner into whitelist
      await this.whitelist.importList(whitelist_have_owner, 3);      
      await this.crowdsale.sendTransaction({ value: value, from: owner }).should.be.rejectedWith(EVMRevert);
      await this.crowdsale.buyTokens(owner, { value: value, from: owner }).should.be.rejectedWith(EVMRevert);
    });

    it('owner can not buy token after premium sale-start even if owner is in premium sale whitelist', async function () {
      await increaseTimeTo(this.premiumSales_startTime);
      const whitelist_have_owner = [owner, owner, purchaser,purchaser2];// add users and owner into whitelist
      await this.whitelist.importList(whitelist_have_owner, 3);      
      await this.crowdsale.sendTransaction({ value: value, from: owner }).should.be.rejectedWith(EVMRevert);
      await this.crowdsale.buyTokens(owner, { value: value, from: owner }).should.be.rejectedWith(EVMRevert);
    });

    it('should reject payments after premium sale-start if user is in pre sale whitelist', async function () {
      await increaseTimeTo(this.premiumSales_startTime);
      const whitelist = [ purchaser,purchaser2];// add users and owner into whitelist
      await this.whitelist.importList(whitelist, 1);       
      await this.crowdsale.sendTransaction({ value: value, from: purchaser }).should.be.rejectedWith(EVMRevert);
      await this.crowdsale.buyTokens(purchaser, { value: value, from: purchaser }).should.be.rejectedWith(EVMRevert);
    });     

    it('should reject payments after premium sale-start if user is in public sale whitelist', async function () {
      await increaseTimeTo(this.premiumSales_startTime);
      const whitelist = [ purchaser,purchaser2];// add users and owner into whitelist
      await this.whitelist.importList(whitelist, 2);       
      await this.crowdsale.sendTransaction({ value: value, from: purchaser }).should.be.rejectedWith(EVMRevert);
      await this.crowdsale.buyTokens(purchaser, { value: value, from: purchaser }).should.be.rejectedWith(EVMRevert);
    });    

    it('should reject payments after premium sale-start if user not in premium sale whitelist', async function () {
      await increaseTimeTo(this.premiumSales_startTime);
      await this.crowdsale.sendTransaction({ value: value, from: purchaser }).should.be.rejectedWith(EVMRevert);
      await this.crowdsale.buyTokens(purchaser, { value: value, from: purchaser }).should.be.rejectedWith(EVMRevert);
    });  

    it('should accept payments after premium sale-start if user in premium sale whitelist', async function () {
      await increaseTimeTo(this.premiumSales_startTime);
      const whitelist = [purchaser,purchaser3];// add users into whitelist
      await this.whitelist.importList(whitelist, 3);
      await this.crowdsale.sendTransaction({ value: ether(25), from: purchaser3 }).should.be.fulfilled;
    });

    it('should accept payments after pre sale-start if user in premium sale whitelist', async function () {
      await increaseTimeTo(this.preSales_startTime);
      const whitelist = [purchaser,purchaser4];// add users into whitelist
      await this.whitelist.importList(whitelist, 3);
      await this.crowdsale.sendTransaction({ value: ether(25), from: purchaser4 }).should.be.fulfilled;
    });

    it('should accept payments after public sale-start if user in premium sale whitelist', async function () {
      await increaseTimeTo(this.publicSales_startTime);
      const whitelist = [purchaser,purchaser3];// add users into whitelist
      await this.whitelist.importList(whitelist, 3);
      await this.crowdsale.sendTransaction({ value: value, from: purchaser3 }).should.be.fulfilled;
    });
  });

});
