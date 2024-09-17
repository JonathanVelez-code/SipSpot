
document.addEventListener('DOMContentLoaded', () => {
    let productCount = 1;

    document.getElementById('addProductTabButton').addEventListener('click', () => {
        const tabs = document.getElementById('productTabs');
        const tabContent = document.getElementById('productTabContent');

        // Create new tab
        const newTab = document.createElement('li');
        newTab.className = 'nav-item';
        newTab.innerHTML = `
                    <button class="nav-link" id="product-tab-${productCount}" data-bs-toggle="tab" data-bs-target="#product-${productCount}" type="button" role="tab" aria-controls="product-${productCount}" aria-selected="false">Product ${productCount + 1}</button>
                `;
        tabs.appendChild(newTab);

        // Create new tab pane
        const newTabPane = document.createElement('div');
        newTabPane.className = 'tab-pane fade';
        newTabPane.id = `product-${productCount}`;
        newTabPane.role = 'tabpanel';
        newTabPane.setAttribute('aria-labelledby', `product-tab-${productCount}`);
        newTabPane.innerHTML = `
                    <input type="text" name="products[${productCount}][name]" placeholder="Product Name" class="form-control mb-2" required>
                    <input type="text" name="products[${productCount}][imageUrl]" placeholder="Product Image URL" class="form-control mb-2" required>
                    <input type="text" name="products[${productCount}][price]" placeholder="Product Price" class="form-control mb-2" required>
                    <input type="text" name="products[${productCount}][weight]" placeholder="Product Weight" class="form-control mb-2">
                    <input type="text" name="products[${productCount}][roast]" placeholder="Product Roast" class="form-control mb-2">
                `;
        tabContent.appendChild(newTabPane);

        // Activate new tab
        document.querySelector(`#product-tab-${productCount}`).click();
        productCount++;
    });
});