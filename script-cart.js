let updateCartItem = () => {
    const cart = JSON.parse(window.localStorage.getItem('cart'));

    if(cart != null){
        document.getElementById('cart-total-item').innerText = cart.totalQuantity;
        document.getElementById('cart-total-item').classList.remove('visually-hidden');
    }
}

updateCartItem();

function formatRupiah(rupiah) {
    let arrayRupiah = rupiah.toString().split('');
    let counter = 0;
    let formatRP = '';

    for (var i = arrayRupiah.length; i > 0; i--) {
        counter++;
        if(counter == 3 && i != 1){
            formatRP = "." + arrayRupiah[i - 1] + formatRP ;
            counter = 0;

        } else {
            formatRP = arrayRupiah[i - 1] + formatRP; 
        }
    }
    return formatRP;
}

function deleteItemFromCart(elementLink){
    
    if (confirm("Are you sure to delete?") === true) {   
        const idDeletedPetrol = elementLink.parentNode.previousElementSibling.previousElementSibling.childNodes[1].innerText;

        const objectCart = JSON.parse(window.localStorage.getItem('cart')).products;

        let indexIDDeletedPetrol = objectCart.findIndex(product => product.idPetrol = idDeletedPetrol);

        objectCart.splice(indexIDDeletedPetrol, 1);

        const totalQuantity = objectCart.reduce(
            (accumulator,currentObject) => parseInt(accumulator) + parseInt(currentObject.amountLiter),
            0
        );

        if(objectCart.length > 0){
            window.localStorage.setItem('cart', JSON.stringify({products: objectCart, totalQuantity}));
        } else {
            window.localStorage.removeItem('cart');
        }
        
    }
}

function renderCartItems(){
    let cartItems = '';
    let cartItem = '';
    let total = 0;
    

    if(window.localStorage.getItem('cart') != null){
        const cart = JSON.parse(window.localStorage.getItem('cart')).products;
        cart.forEach(item => {
            
            cartItem = `<div href="#" class="list-group-item list-group-item-action" aria-current="true">
                            <div class="d-flex justify-content-between">
                                <p class="visually-hidden">${item.idPetrol}</p>
                                <h5 class="mb-1">${item.namePetrol}</h5>
                                <small>Rp${formatRupiah(item.costPetrol)}/Liter</small>
                            </div>
                            <p class="mb-1">You order ${item.amountLiter} Liters</p>
                            <div class="d-flex justify-content-between">
                                <small>Total Rp${formatRupiah(parseInt(item.costPetrol) * parseInt(item.amountLiter))}</small>
                                <a href="" class="link-success" onclick="deleteItemFromCart(this)">Delete</a>
                            </div>
                        </div>`;
                        // <button class="btn btn-primary" onclick="deleteItemFromCart(this)">Delete</button>
            cartItems += cartItem;
            total = total + (parseInt(item.costPetrol) * parseInt(item.amountLiter));
        })

        cartItem = `<div href="#" class="list-group-item" aria-current="true">
                      <div class="d-flex justify-content-between">
                        <small>Total</small>
                        <b>Rp${formatRupiah(total)}</b>
                      </div>
                    </div>`;
        cartItems += cartItem;

        let cartContainer = document.querySelector('.cart-container');
        cartContainer.innerHTML = cartItems;

        document.getElementById('preorder-btn').classList.remove('disabled');
    } 
}

renderCartItems();

const preorder = document.getElementById('preorder-btn');
preorder.addEventListener('click', async () => {
    
    const itemsPreorder = window.localStorage.getItem('cart');

    const response = await fetch('http://localhost:3300/api/petrol/preorder', {
        credentials: "include",
        method: 'POST',
        // mode: "cors",
        headers: {
            'Content-Type': 'application/json; charset=utf-8'
        },
        body: itemsPreorder
    });

    const result = await response.json();

    if(result.isSuccess){
        window.localStorage.removeItem('cart');
        
        const modalPreorder = new bootstrap.Modal('#modal-result-preorder', {
          keyboard: false
        });

        const modalBody = document.querySelector('.modal-body');
        modalBody.innerHTML = result.message;

        const modalPreorderToggle = document.getElementById('modal-result-preorder'); 
        modalPreorder.show(modalPreorderToggle);
    } else {
        const liveToast = document.getElementById('liveToast');
        const toastBody = document.querySelector('.toast-body');
        toastBody.innerHTML = result.message;
        
        const toastAlertCart = bootstrap.Toast.getOrCreateInstance(liveToast);
        toastAlertCart.show();
    }
});

function reloadPage(){
    location.reload();
}