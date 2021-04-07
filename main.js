// evil (👿) mode subsitutions
const $ = document.querySelectorAll.bind(document);
$.ajax = fetch.bind(window);
function html(strings, ...keys) {
    let result = [strings[0]];
    keys.forEach((key, i) => {
        result.push(key, strings[i + 1]);
    });
    let el = document.createElement('div');
    el.innerHTML = result.join('');
    return el.firstChild;
}

// real deal starts here
const productsWrapperEl = $('#products')[0];
const asideEl = $('#aside')[0];
let activeProductId = null;

function closeAside() {
    if (asideEl.classList.contains('opened')) {
        asideEl.classList.remove('opened')
    }
    if (!asideEl.classList.contains('closed')) {
        asideEl.classList.add('closed')
    }
    activeProductId = null;
}

function openAside(pId) {
    $('#slide-over-title')[0].innerText = pId ? 'Edit Product' : 'Add Product';
    activeProductId = pId;

    if (asideEl.classList.contains('closed')) {
        asideEl.classList.remove('closed')
    }
    if (!asideEl.classList.contains('opened')) {
        asideEl.classList.add('opened')
    }
}

function addProduct() {
    for (let input of $('#product-form [name]')) {
        input.value = '';
    }
    openAside();
}

async function deleteProduct(id) {
    await $.ajax(`https://usman-recipes.herokuapp.com/api/products/${id}`, { method: 'DELETE' });
    window.location.reload();
}

async function editProduct(id) {
    const res = await $.ajax(`https://usman-recipes.herokuapp.com/api/products/${id}`);
    const product = await res.json();

    for (let input of $('#product-form [name]')) {
        if (product[input.name]) {
            input.value = product[input.name];
        }
    }
    openAside(product._id);
}

async function saveOrCreateProduct() {
    let formData = {};
    let fields = ['name', 'price', 'color', 'department', 'description'];
    for (let field of fields) {
        formData[field] = $(`[name="${field}"]`)[0].value
    }

    await $.ajax(
        `https://usman-recipes.herokuapp.com/api/products/${activeProductId ? activeProductId : ''}`,
        {
            method: activeProductId ? 'PUT' : 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(formData),
        }
    );
    window.location.reload();
}

function renderProduct(product) {
    return html`<div class="product">
        <div class="flex">
            <div class="flex-1 truncate">
                <div class="font-semibold text-sm text-gray-400">
                    ${product.department}
                </div>
                <div>
                    <h3 class="text-gray-700 text-xl font-semibold truncate">${product.name}</h3>
                </div>
                <div class="text-lg font-medium text-indigo-500">
                    ${product.price} PKR
                </div>
            </div>
            <div class="flex flex-shrink-0 ml-4 space-x-2 actions transition duration-200 opacity-0">
                <button onclick="editProduct('${product._id}')" type="button" class="action-btn text-gray-400 hover:text-gray-500">
                    <svg fill="none" stroke="currentColor" class="w-5 h-5" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/>
                    </svg>
                </button>
                <button onclick="deleteProduct('${product._id}')" type="button" class="action-btn text-red-400 hover:text-red-500">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                    </svg>
                </button>
            </div>
        </div>
        <p class="mt-4 text-gray-500 font-medium">
            ${product.description}
        </p>
    </div>`;
}


$.ajax('https://usman-recipes.herokuapp.com/api/products')
    .then((res) => {
        return res.json();
    })
    .then((products) => {
        const productsDiv = $('#products')[0];
        for (let product of products) {
            productsDiv.appendChild(renderProduct(product));
        }
    })


$('#product-form')[0].addEventListener('submit', (e) => {
    e.preventDefault();
    saveOrCreateProduct();
})
