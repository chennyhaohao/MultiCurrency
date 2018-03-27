import './Ownable.sol';
import './SafeMath.sol';
import './ERC20.sol';

contract Crowdsale is Ownable {
	using SafeMath for uint256;

	address public tokenAddress;
	address private funder;
	ERC20 public token;
	uint256 public maxCap;
	uint256 public tokenSold = 0;
	mapping(address => uint256) tokenReserved;
	event Issue(address recipient, uint256 amount);


	function Crowdsale(address _tokenAddress) public {
		owner = msg.sender;
		tokenAddress = _tokenAddress;
		token = ERC20(tokenAddress);
	}

	function setMaxCap(uint256 _maxCap) public onlyOwner {
		maxCap = _maxCap;
	}

	function setFunder(address _funder) public onlyOwner {
		funder = _funder;
	}

	function reserve(address recipient, uint256 amount) public onlyOwner {
		require(amount > 0);
		require(tokenSold.add(amount) <= maxCap); //Cannot exceed cap
		tokenSold = tokenSold.add(amount);
		tokenReserved[recipient] = tokenReserved[recipient].add(amount);
	}

	function cancelRsvp(address recipient, uint256 amount) public onlyOwner {
		require(amount > 0);
		require(amount <= tokenReserved[recipient]); //When there's not enough to cancel
		tokenReserved[recipient] = tokenReserved[recipient].sub(amount);
		tokenSold = tokenSold.sub(amount);
	}

	function issue(address recipient, uint256 amount, bool reserved) 
	public onlyOwner {
		if (reserved) { //Already reserved and added to tokenSold
			require(amount <= tokenReserved[recipient]); //Cannot contribute more than reserved
			tokenReserved[recipient] = tokenReserved[recipient].sub(amount);
			//This part of reservation is spent
		} else {
			require(tokenSold.add(amount) <= maxCap); //Cannot exceed cap
			tokenSold = tokenSold.add(amount);
		}
		//balances[recipient] = balances[recipient].add(amount);
		//totalSupply = totalSupply.add(amount);
		assert(token.transferFrom(funder, recipient, amount)); //Transfer to recipient
		Issue(recipient, amount);
	}
}