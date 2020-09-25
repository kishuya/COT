pragma solidity ^0.4.18;

library Discount{

  	/**
	* @dev Function to give discount when presale
	* @param _weiAmount The wei amount that buyer send
	* @return A uint256 that indicates if the operation was successful.
	*/
	function preSaleDiscount(uint256 _weiAmount, uint256 basic_tokens)public pure returns (uint256){
		uint256 discounted_token;

		if(_weiAmount < 41.66*10**18){
			discounted_token = basic_tokens*100/95; //5% discount
		}else if(_weiAmount < 83.33*10**18){
			discounted_token = basic_tokens*10/9; //10% discount
		}else if(_weiAmount < 250*10**18){
			discounted_token = basic_tokens*10/8; //20% discount
		}else{
			discounted_token = basic_tokens*10/7; //30% discount
		}

		return discounted_token;
	}	

  	/**
	* @dev Function to give discount when premium sale
	* @param _weiAmount The wei amount that buyer send
	* @return A uint256 that indicates if the operation was successful.
	*/
	function premiumSaleDiscount(uint256 _weiAmount, uint256 basic_tokens)public pure returns (uint256){
		uint256 discounted_token;

		if(_weiAmount < 41.66*10**18){
			discounted_token = basic_tokens*100/95; //5% discount
		}else if(_weiAmount < 83.33*10**18){
			discounted_token = basic_tokens*10/9; //10% discount
		}else if(_weiAmount < 250*10**18){
			discounted_token = basic_tokens*10/8; //20% discount
		}else{
			discounted_token = basic_tokens*10/6; //40% discount
		}

		return discounted_token;
	}	
}