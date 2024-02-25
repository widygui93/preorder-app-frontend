const updateCartItem = () => {
    const cart = JSON.parse(window.localStorage.getItem('cart'));

    if(cart != null){
        document.getElementById('cart-total-item').innerText = cart.totalQuantity;
        document.getElementById('cart-total-item').classList.remove('visually-hidden');
    }
}

updateCartItem();

async function getUser(){
    try {
        let res = await fetch('http://localhost:3300/api/user/',{credentials: "include"});
        return await res.json();
    } catch(error){
        console.error(error);
    }
}

const renderAccountPage = async () => {
    let accountPage = "";
    let data = await getUser();

    if(data){
        accountPage = `<h3>${data.user.name}</h3>
          <h6>${data.user.email}</h6>
          <a href="list-preoder.html" id="list-preoder-btn" class="btn btn-success btn-lg my-3 p-3">List Preorder</a>
          <a href="shipping-address.html" id="shipping-address-btn" class="btn btn-success btn-lg my-3 p-3">Shipping Address</a>
          <button id="logout-btn" type="button" onclick="clickLogout()" class="btn btn-outline-success btn-lg my-3 p-3">Log out</button>`;
    } else{
        accountPage = `<h3>You are not Login</h3>
            <a href="signup.html" id="login-signup-btn" class="btn btn-success btn-lg my-3 p-3">Login / Sign up</a>`; 
    }
    let accountContainer = document.querySelector('.account-page');
    accountContainer.innerHTML = accountPage;
}

renderAccountPage();

const clickLogout = async () => {

    try {
        let res = await fetch('http://localhost:3300/logout',{credentials: "include"});
    } catch(error){
        console.error(error);
    }

    location.assign('index.html');

}