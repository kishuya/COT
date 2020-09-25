
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
const OwnerAddressInfo = artifacts.require("./OwnerAddressInfo.sol");

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
    this.ownerAddressInfo = await OwnerAddressInfo.new(owner, unsale_owner);
  });


  it('should return the correct address', async function () {

    var sale_token_owner = await this.ownerAddressInfo.getSaleAddress();
    var unsale_token_owner = await this.ownerAddressInfo.getUnsaleAddress();
    sale_token_owner.should.equal(owner);
    unsale_token_owner.should.equal(unsale_owner);

  });

});
