const { expect } = require('chai');
const { ethers } = require('hardhat');

const tokens = (n) => {
	return ethers.utils.parseEther(n.toString(), 'ether')
}

describe('Token', () => {
	let token, accounts, deployer, receiver})

	beforeEach (async () => {
		const Token = await ethers.getContractFactory('Token')
		token = await Token.deploy('Dapp University', 'DAPP', '1000000')

		accounts = await ethers.getSigners()
		deployer = accounts[0]
		receiver = accounts[1]
	})


	describe('Deployment', () => {
		const name = 'Dapp University'
		const symbol = 'DAPP'
		const decimals = '18'
		const totalSupply = tokens('1000000')

		it('has correct name', async () => {
			expect(await token.name()).to.equal('Dapp University')
		})

		it('has correct symbol', async () => {
			expect(await token.symbol()).to.equal('DAPP');
		})

		it('has correct decimals', async () => {
			expect(await token.decimals()).to.equal('18');
		})

		it('has correct total supply', async () => {
			expect(await token.totalSupply()).to.equal(totalSupply);
		})

		it('assigns total supply to deployer', async () => {
			expect(await token.balanceOf(deployer.address)).to.equal(totalSupply);
		})

	})
	
	describe('Sending Tokens', () => {
		let amount, transaction, result

		describe('Success', () => {
			beforeEach(async () => {
				amount = tokens(100)
				transaction = await token.connect(deployer).transfer(receiver.address, amount)
				result = await transaction.wait()
			})

			it('transfers token balances', async () => {
				// Log token balance before transfer
				console.log('deployer balance before transfer', await token.balanceOf(deployer.address))
				console.log('receiver balance before transfer', await token.balanceOf(receiver.address))
				
				expect(await token.balanceOf(deployer.address)).to.equal(tokens(999900))
				expect(await token.balanceOf(receiver.address)).to.equal(amount)

				// Log balance after transfer
				console.log('deployer balance after transfer', await token.balanceOf(deployer.address))
				console.log('receiver balance after transfer', await token.balanceOf(receiver.address))
				// Ensure that  tokens were transferred (balance changed)
			})

			it('emits a Transfer event', async () => {
				const event = result.events[0]
				console.log(event)
				expect(await event.event).to.equal('Transfer')

				const args = event.args
				expect(args._from).to.equal(deployer.address)
				expect(args._to).to.equal(receiver.address)
				expect(args._value).to.equal(amount)
			})
		})
	})

		describe('Failure', () => {
			it('rejects insufficient balances', async () => {
				const invalidAmount = tokens(100000000)
				await expect(token.connect(deployer).transfer(receiver.address, invalidAmount)).to.be.reverted
			})

			it('rejects invalid recipient', async () => {
				const amount = tokens(100)
				await expect(token.connect(deployer).transfer('0x0000000000000000000000000000000000000000', amount)).to.be.reverted
			})
		})
	
