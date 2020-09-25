
export const event_parameter = {
  rate: function () { return new web3.BigNumber(10000); },
  totalSupply: function () { return 1000000000; },
  randomNum: function () { return (Math.random() * 10 + 1).toFixed(2); },
  lowest_weiAmount: function () { return 1*10**18; }
};


