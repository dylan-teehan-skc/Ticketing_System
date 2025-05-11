const { web3, ticketSales } = require('../shared/js/web3-config');

// Update price and total cost when page loads
window.onload = async function() {
    try {
        const price = await ticketSales.methods.ticketPrice().call();
        document.getElementById('ticketPrice').textContent = 
            web3.utils.fromWei(price, 'ether') + ' SETH';
        
        updateTotalCost();
    } catch (error) {
        alert('Error loading ticket price: ' + error.message);
    }
};

// Update total cost when ticket amount changes
document.getElementById('ticketAmount').addEventListener('input', updateTotalCost);

// Update total cost when payment method changes
document.querySelectorAll('input[name="paymentMethod"]').forEach(radio => {
    radio.addEventListener('change', updateTotalCost);
});

async function updateTotalCost() {
    try {
        const price = await ticketSales.methods.ticketPrice().call();
        const amount = document.getElementById('ticketAmount').value;
        const total = web3.utils.toBN(price).mul(web3.utils.toBN(amount));
        document.getElementById('totalCost').textContent = 
            web3.utils.fromWei(total, 'ether') + ' SETH';
    } catch (error) {
        console.error('Error updating total cost:', error);
    }
}

async function buyTickets() {
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
        // Check if sales are active
        const salesActive = await ticketSales.methods.salesActive().call();
        if (!salesActive) {
            alert('Ticket sales are currently inactive!');
            return;
        }

        // Show transaction status
        const statusDiv = document.getElementById('transactionStatus');
        const detailsDiv = document.getElementById('statusDetails');
        statusDiv.style.display = 'block';
        detailsDiv.innerHTML = '<p>Processing transaction...</p>';

        const price = await ticketSales.methods.ticketPrice().call();
        const totalCost = web3.utils.toBN(price).mul(web3.utils.toBN(amount));
        
        const transaction = await ticketSales.methods.buyTicket().send({
            from: address,
            value: totalCost.toString()
        });

        // Update status
        detailsDiv.innerHTML = `
            <p class="alert alert-success">Transaction successful!</p>
            <p><strong>Transaction Hash:</strong> ${transaction.transactionHash}</p>
            <p><strong>Tickets Purchased:</strong> ${amount}</p>
            <p><strong>Total Cost:</strong> ${web3.utils.fromWei(totalCost, 'ether')} SETH</p>
        `;

        // Update ticket amount input
        document.getElementById('ticketAmount').value = 1;
        updateTotalCost();

    } catch (error) {
        document.getElementById('statusDetails').innerHTML = `
            <p class="alert alert-error">Transaction failed: ${error.message}</p>
        `;
    }
} 