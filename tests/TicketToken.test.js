const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("TicketToken", function () {
    let TicketToken;
    let ticketToken;
    let owner;
    let buyer;
    let seller;
    let maxSupply;
    let ticketPrice;

    beforeEach(async function () {
        [owner, buyer, seller] = await ethers.getSigners();
        
        maxSupply = 1000;
        ticketPrice = ethers.parseEther("0.025");
        
        // Deploy contract
        TicketToken = await ethers.getContractFactory("TicketToken");
        ticketToken = await TicketToken.deploy(maxSupply, ticketPrice);
        await ticketToken.waitForDeployment();
    });

    describe("Deployment", function () {
        it("Should set the right owner", async function () {
            expect(await ticketToken.owner()).to.equal(owner.address);
        });

        it("Should set the correct max supply", async function () {
            expect(await ticketToken.maxSupply()).to.equal(maxSupply);
        });

        it("Should set the correct ticket price", async function () {
            expect(await ticketToken.ticketPrice()).to.equal(ticketPrice);
        });

        it("Should set sales as active", async function () {
            expect(await ticketToken.salesActive()).to.be.true;
        });

        it("Should mint all tickets to the contract", async function () {
            expect(await ticketToken.balanceOf(await ticketToken.getAddress())).to.equal(maxSupply);
        });
    });

    describe("ERC20 Functions", function () {
        it("Should return correct total supply", async function () {
            expect(await ticketToken.totalSupply()).to.equal(maxSupply);
        });

        it("Should return correct balance", async function () {
            expect(await ticketToken.balanceOf(await ticketToken.getAddress())).to.equal(maxSupply);
        });

        it("Should transfer tokens correctly", async function () {
            // First buy a ticket
            await ticketToken.connect(buyer).buyTicket({ value: ticketPrice });
            
            // Then transfer it
            await ticketToken.connect(buyer).transfer(seller.address, 1);
            expect(await ticketToken.balanceOf(seller.address)).to.equal(1);
        });

        it("Should handle approvals correctly", async function () {
            // First buy a ticket
            await ticketToken.connect(buyer).buyTicket({ value: ticketPrice });
            
            // Approve seller to spend buyer's tokens
            await ticketToken.connect(buyer).approve(seller.address, 1);
            expect(await ticketToken.allowance(buyer.address, seller.address)).to.equal(1);
        });

        it("Should handle transferFrom correctly", async function () {
            // First buy a ticket
            await ticketToken.connect(buyer).buyTicket({ value: ticketPrice });
            
            // Approve and transfer
            await ticketToken.connect(buyer).approve(seller.address, 1);
            await ticketToken.connect(seller).transferFrom(buyer.address, seller.address, 1);
            expect(await ticketToken.balanceOf(seller.address)).to.equal(1);
        });
    });

    describe("Ticket-specific Functions", function () {
        it("Should allow buying tickets", async function () {
            await ticketToken.connect(buyer).buyTicket({ value: ticketPrice });
            expect(await ticketToken.balanceOf(buyer.address)).to.equal(1);
        });

        it("Should refund excess payment", async function () {
            const excessAmount = ethers.parseEther("0.01");
            const initialBalance = await ethers.provider.getBalance(buyer.address);
            
            await ticketToken.connect(buyer).buyTicket({ 
                value: ticketPrice + excessAmount 
            });
            
            const finalBalance = await ethers.provider.getBalance(buyer.address);
            expect(finalBalance).to.be.closeTo(
                initialBalance - ticketPrice,
                ethers.parseEther("0.001") // Allow for gas costs
            );
        });

        it("Should allow selling tickets", async function () {
            // First buy a ticket
            await ticketToken.connect(buyer).buyTicket({ value: ticketPrice });
            
            // Then sell it back
            const initialBalance = await ethers.provider.getBalance(buyer.address);
            const tx = await ticketToken.connect(buyer).sellTicket(1);
            const receipt = await tx.wait();
            const gasCost = receipt.gasUsed * receipt.gasPrice;
            
            const finalBalance = await ethers.provider.getBalance(buyer.address);
            // Initial balance - gas cost + ticket price refund
            expect(finalBalance).to.be.closeTo(
                initialBalance - gasCost + ticketPrice,
                ethers.parseEther("0.001") // Allow for small variations
            );
        });

        it("Should not allow buying when sales are inactive", async function () {
            await ticketToken.setSalesStatus(false);
            await expect(
                ticketToken.connect(buyer).buyTicket({ value: ticketPrice })
            ).to.be.revertedWith("Ticket sales are not active");
        });
    });

    describe("Owner Functions", function () {
        it("Should allow owner to change sales status", async function () {
            await ticketToken.setSalesStatus(false);
            expect(await ticketToken.salesActive()).to.be.false;
        });

        it("Should allow owner to change ticket price", async function () {
            const newPrice = ethers.parseEther("0.05");
            await ticketToken.setTicketPrice(newPrice);
            expect(await ticketToken.ticketPrice()).to.equal(newPrice);
        });

        it("Should allow owner to transfer ownership", async function () {
            await ticketToken.transferOwnership(buyer.address);
            expect(await ticketToken.owner()).to.equal(buyer.address);
        });

        it("Should allow owner to withdraw funds", async function () {
            // First buy a ticket to add funds to contract
            await ticketToken.connect(buyer).buyTicket({ value: ticketPrice });
            
            const initialBalance = await ethers.provider.getBalance(owner.address);
            await ticketToken.withdrawFunds();
            
            const finalBalance = await ethers.provider.getBalance(owner.address);
            expect(finalBalance).to.be.gt(initialBalance);
        });

        it("Should not allow non-owners to call owner functions", async function () {
            await expect(
                ticketToken.connect(buyer).setSalesStatus(false)
            ).to.be.revertedWith("Only owner can call this function");
            
            await expect(
                ticketToken.connect(buyer).setTicketPrice(ethers.parseEther("0.05"))
            ).to.be.revertedWith("Only owner can call this function");
            
            await expect(
                ticketToken.connect(buyer).withdrawFunds()
            ).to.be.revertedWith("Only owner can call this function");
        });
    });

    describe("Error Cases", function () {
        it("Should not allow buying with insufficient payment", async function () {
            const insufficientAmount = ethers.parseEther("0.01");
            await expect(
                ticketToken.connect(buyer).buyTicket({ value: insufficientAmount })
            ).to.be.revertedWith("Insufficient payment");
        });

        it("Should not allow selling more tickets than owned", async function () {
            await expect(
                ticketToken.connect(buyer).sellTicket(1)
            ).to.be.revertedWith("Insufficient tickets");
        });

        it("Should not allow setting zero ticket price", async function () {
            await expect(
                ticketToken.setTicketPrice(0)
            ).to.be.revertedWith("Price must be greater than 0");
        });

        it("Should not allow transferring to zero address", async function () {
            await expect(
                ticketToken.connect(buyer).transfer(ethers.ZeroAddress, 1)
            ).to.be.revertedWith("Transfer to zero address");
        });
    });
}); 