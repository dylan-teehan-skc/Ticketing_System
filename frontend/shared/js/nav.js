// Get current page path
const currentPath = window.location.pathname;

// Navigation items with consistent order and text
const navItems = [
    { path: 'index.html', text: 'Home' },
    { path: 'createWallet/index.html', text: 'Wallet' },
    { path: 'checkBalance/index.html', text: 'Check Balance' },
    { path: 'buyTicket/index.html', text: 'Buy Ticket' },
    { path: 'transferTicket/index.html', text: 'Transfer Ticket' }
];

// Create navigation HTML
function createNavigation() {
    // Create nav container
    const nav = document.createElement('nav');
    nav.className = 'nav';
    
    // Create unordered list
    const ul = document.createElement('ul');
    ul.className = 'nav-list';
    
    // Always create navigation items in the same order
    navItems.forEach(item => {
        const li = document.createElement('li');
        const a = document.createElement('a');
        
        // Adjust path based on current page depth
        let path = item.path;
        if (currentPath.includes('/')) {
            // If we're in a subdirectory, add '../' to the path
            path = '../' + item.path;
        }
        
        a.href = path;
        a.textContent = item.text;
        
        // Add active class if current path matches
        const currentPage = currentPath.split('/').pop() || 'index.html';
        const itemPage = item.path.split('/').pop();
        if (currentPage === itemPage) {
            a.className = 'active';
        }
        
        li.appendChild(a);
        ul.appendChild(li);
    });
    
    nav.appendChild(ul);
    return nav;
}

// Insert navigation into the page
document.addEventListener('DOMContentLoaded', () => {
    const navContainer = document.querySelector('.nav-container');
    if (navContainer) {
        // Clear any existing content
        navContainer.innerHTML = '';
        // Add the navigation
        navContainer.appendChild(createNavigation());
    } else {
        console.error('Navigation container not found!');
    }
}); 