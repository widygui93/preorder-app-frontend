async function getPetrols(){
    try {
        let res = await fetch('http://localhost:3300/api/petrol/');
        return await res.json();
    } catch(error){
        console.error(error);
    }
}

async function renderPetrols(){
    let petrols = await getPetrols();
    let petrolCards = '';
    let petrolQuantity = "0";
    let rupiah = '';
    petrols.forEach(petrol => {
        rupiah = formatRupiah(petrol.cost_petrol);
        if(JSON.parse(window.localStorage.getItem('cart')) != null){
            petrolQuantity = JSON.parse(window.localStorage.getItem('cart')).products.find(({idPetrol}) => idPetrol === petrol.id_petrol);

            petrolQuantity = petrolQuantity === undefined ? "0": petrolQuantity.amountLiter;
        }
        

        let petrolCard = `<div class="card" style="width: 18rem;">
                                <img src="./${petrol.path_img_petrol}" class="card-img-top" alt="pertamina-dex">
                                <div class="card-body">
                                    <div class="d-none">${petrol.id_petrol}</div>
                                    <h5 class="card-title">${petrol.name_petrol}</h5>
                                    <p class="card-text">Rp<strong class="rupiah-petrol">${rupiah}</strong> / liter</p>
                                    <div class="btn-group btn-group-sm" role="group" aria-label="Small button group">
                                        <button type="button" class="btn btn-outline-success minus-btn" onclick="minusOneLiter(this)">-</button>
                                        <button type="button" class="btn btn-outline-success" disabled>${petrolQuantity}</button>
                                        <button type="button" class="btn btn-outline-success plus-btn" onclick="plusOneLiter(this)">+</button>
                                    </div>
                                    <button type="button" class="btn btn-outline-success btn-sm btn-add-to-cart" id="liveToastBtn" value="${petrol.cost_petrol}" onclick="addToCart(this)">Add to Cart</button>
                                </div>
                            </div>`;
    petrolCards += petrolCard;
    });

    let petrolContainer = document.querySelector('.petrol-container');
    petrolContainer.innerHTML = petrolCards;
}

renderPetrols();

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

function addToCart(elementBtn) {
    
    const liter = elementBtn.previousElementSibling.children[1].innerText;
    if(liter > 0){
        const idPetrol = elementBtn.previousElementSibling.previousElementSibling.previousElementSibling.previousElementSibling.innerText;
        const costPetrol = elementBtn.value;
        const namePetrol = elementBtn.previousElementSibling.previousElementSibling.previousElementSibling.innerText;
        const amountLiter = elementBtn.previousElementSibling.children[1].innerText;

        const objectCart = JSON.parse(window.localStorage.getItem('cart'));

        // check if objectCart is Empty or not
        if(objectCart === null){
            const product = {idPetrol,costPetrol, namePetrol, amountLiter};

            const products = [];
            products.push(product);

            window.localStorage.setItem('cart', JSON.stringify({products, totalQuantity: amountLiter}));
        } else {

            let isProductFound = false;
            let totalQuantity = 0;

            objectCart.products.forEach(product => {
                // check if item that we want to add to cart has already in the cart
                if(idPetrol === product.idPetrol) {
                    product.amountLiter = amountLiter;
                    isProductFound = true;
                }

                totalQuantity = totalQuantity + parseInt(product.amountLiter);
            })

            if(isProductFound === false){
                objectCart.products.push({idPetrol,costPetrol, namePetrol, amountLiter});
                totalQuantity = totalQuantity + parseInt(amountLiter);
            }

            window.localStorage.setItem('cart', JSON.stringify({products: objectCart.products, totalQuantity}));
        }

    } else {
        const liveToast = document.getElementById('liveToast');
        
        const toastAlertCart = bootstrap.Toast.getOrCreateInstance(liveToast);
        toastAlertCart.show();
        
    }

    updateCartItem();
}

function minusOneLiter(elementMinus) {
    let liter = elementMinus.nextElementSibling.innerText;
    if(liter > 0) {
        liter--;
        elementMinus.nextElementSibling.innerText = liter;
    }
}

function plusOneLiter(elementPlus) {
    let liter = elementPlus.previousElementSibling.innerText;
    liter++;
    elementPlus.previousElementSibling.innerText = liter;
}


let updateCartItem = () => {
    const cart = JSON.parse(window.localStorage.getItem('cart'));

    if(cart != null){
        document.getElementById('cart-total-item').innerText = cart.totalQuantity;
        document.getElementById('cart-total-item').classList.remove('visually-hidden');
    }
}

updateCartItem();
