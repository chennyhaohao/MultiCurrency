import './StandardToken.sol';
import './Ownable.sol';

contract DemoToken is StandardToken, Ownable{
	uint8 public decimals = 18;
	uint256 maxCap = 1000 * (10**uint256(decimals));
	uint256 tokenSold = 0;
	mapping(address => uint256) tokenReserved;
	event Issue(address recipient, uint256 amount);


	function DemoToken() public {
		owner = msg.sender;
		balances[msg.sender] = (10**uint256(decimals)).mul(100);
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
		if (reserved) {
			require(amount <= tokenReserved[recipient]); //Cannot contribute more than reserved
			tokenReserved[recipient] = tokenReserved[recipient].sub(amount);
			//This part of reservation is spent
		} else {
			require(tokenSold.add(amount) <= maxCap); //Cannot exceed cap
			tokenSold = tokenSold.add(amount);
		}
		balances[recipient] = balances[recipient].add(amount);
		totalSupply = totalSupply.add(amount);
		Issue(recipient, amount);
	}
}