const { web3, ticketSales } = require('../shared/js/web3-config');

// Update refund amount when page loads
window.onload = async function() {
    try {
        const price = await ticketSales.methods.ticketPrice().call();
        document.getElementById('refundAmount').textContent = web3.utils.fromWei(price, 'ether') + ' ETH';
        updateRefundAmount();
    } catch (error) {
        alert('Error loading ticket price: ' + error.message);
    }
};

// Update refund amount when ticket amount changes
document.getElementById('ticketAmount').addEventListener('input', updateRefundAmount);

async function updateRefundAmount() {
    try {
        const price = await ticketSales.methods.ticketPrice().call();
        const amount = document.getElementById('ticketAmount').value;
        const total = web3.utils.toBN(price).mul(web3.utils.toBN(amount));
        document.getElementById('refundAmount').textContent = web3.utils.fromWei(total, 'ether') + ' ETH';
    } catch (error) {
        console.error('Error updating refund amount:', error);
    }
}

async function returnTickets() {
    const address = document.getElementById('walletAddress').value;
    const amount = document.getElementById('ticketAmount').value;

    if (!web3.utils.isAddress(address)) {
        alert('Invalid wallet address!');
        return;
    }

    if (amount < 1) {
        alert('Please enter a valid number of tickets!');
        return;
    }

    try {
        // Check if user has enough tickets
        const ticketBalance = await ticketToken.methods.balanceOf(address).call();
        if (ticketBalance < amount) {
            alert('Insufficient ticket balance!');
            return;
        }

        // Show transaction status
        const statusDiv = document.getElementById('transactionStatus');
        const detailsDiv = document.getElementById('statusDetails');
        statusDiv.style.display = 'block';
        detailsDiv.innerHTML = '<p>Processing transaction...</p>';

        // Send transaction
        const transaction = await ticketSales.methods.returnTicket(amount).send({
            from: address
        });

        // Update status
        detailsDiv.innerHTML = `
            <p class="alert alert-success">Tickets returned successfully!</p>
            <p><strong>Transaction Hash:</strong> ${transaction.transactionHash}</p>
            <p><strong>Tickets Returned:</strong> ${amount}</p>
            <p><strong>Refund Amount:</strong> ${web3.utils.fromWei(web3.utils.toBN(price).mul(web3.utils.toBN(amount)), 'ether')} ETH</p>
        `;

        // Update ticket amount input
        document.getElementById('ticketAmount').value = 1;
        updateRefundAmount();

    } catch (error) {
        document.getElementById('statusDetails').innerHTML = `
            <p class="alert alert-error">Transaction failed: ${error.message}</p>
        `;
    }
} 